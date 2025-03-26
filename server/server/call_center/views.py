import africastalking
import re
from django.conf import settings
from django.utils import timezone
from django.db.models import Q
from django.contrib.auth import get_user_model
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import CallLog, CallbackURL, PhoneNumber
from .serializers import (
    CallLogSerializer, CallbackURLSerializer, PhoneNumberSerializer,
    MakeCallSerializer, CallStatusSerializer
)
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

import logging
from django.utils.timezone import now as timezone_now
logger = logging.getLogger(__name__)
from django.http import HttpResponse

User = get_user_model()

# Initialize Africa's Talking SDK
username = settings.AFRICASTALKING_USERNAME
api_key = settings.AFRICASTALKING_API_KEY
africastalking.initialize(username, api_key)
voice = africastalking.Voice

class PhoneNumberViewSet(viewsets.ModelViewSet):
    queryset = PhoneNumber.objects.all()
    serializer_class = PhoneNumberSerializer
    permission_classes = [IsAuthenticated]

class CallLogViewSet(viewsets.ModelViewSet):
    queryset = CallLog.objects.all().order_by('-start_time')
    serializer_class = CallLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Admin can see all calls, others see only their own
        if user.groups.filter(name="Admins").exists():
            return CallLog.objects.all().order_by('-start_time')

        # Otherwise, show only calls they're involved in
        return CallLog.objects.filter(caller=user).order_by('-start_time')

class CallbackURLViewSet(viewsets.ModelViewSet):
    queryset = CallbackURL.objects.all()
    serializer_class = CallbackURLSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        # Only admin can manage callback URLs
        if self.request.user.groups.filter(name="Admins").exists():
            return [IsAuthenticated()]
        return super().get_permissions()

class MakeCallView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = MakeCallSerializer(data=request.data)
        if serializer.is_valid():
            phone_number = serializer.validated_data['phone_number']

            # Validate phone number format
            if not re.match(r'^\+\d{10,15}$', phone_number):
                return Response(
                    {"error": "Invalid phone number format. Use E.164 format like +254700123456"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                # Get active callback URL
                callback_url = CallbackURL.objects.filter(is_active=True).first()
                if not callback_url:
                    callback_url = settings.CALLBACK_URL

                # Make the call using Africa's Talking Voice API
                response = voice.call(
                    callFrom=settings.AFRICASTALKING_CALLER_ID,
                    callTo=[phone_number]
                )
                logger.info(f"Africa's Talking API response: {response}")

                # Log the call
                call_log = CallLog.objects.create(
                    session_id=response['entries'][0]['sessionId'],
                    caller_number=phone_number,
                    destination_number=settings.AFRICASTALKING_CALLER_ID,
                    status="queued",
                    caller=request.user
                )

                return Response({
                    "message": "Call initiated successfully via Africa's Talking",
                    "call_id": call_log.id,
                    "session_id": call_log.session_id
                }, status=status.HTTP_201_CREATED)

            except Exception as e:
                logger.error(f"Error initiating call: {str(e)}")
                return Response({"error": f"Error initiating call: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CallStatusWebhook(APIView):
    """Webhook to receive call status updates from Africa's Talking"""
    permission_classes = []  # No authentication for webhook

    def post(self, request):
        try:
            # Log the incoming request data
            logger.info(f"Incoming webhook data: {request.data}")

            # Validate the incoming data using the serializer
            serializer = CallStatusSerializer(data=request.data)
            if not serializer.is_valid():
                logger.error(f"Validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            # Extract validated data
            session_id = serializer.validated_data['sessionId']
            caller_number = serializer.validated_data['callerNumber']
            destination_number = serializer.validated_data.get('destinationNumber')
            direction = serializer.validated_data.get('direction', 'unknown')
            call_status = serializer.validated_data.get('callSessionState', 'unknown')

            # Determine direction explicitly
            if direction.lower() == 'inbound':
                direction = 'inbound'
                # Swap caller_number and destination_number for inbound calls
                caller_number, destination_number = destination_number, caller_number
            elif caller_number and destination_number:
                # If caller_number matches your Africa's Talking number, it's an inbound call
                africastalking_number = settings.AFRICASTALKING_CALLER_ID
                if caller_number == africastalking_number:
                    direction = 'inbound'
                    caller_number, destination_number = destination_number, caller_number
                else:
                    direction = 'outbound'
            else:
                direction = 'outbound'

            try:
                # Retrieve or create the call log entry
                call_log, created = CallLog.objects.get_or_create(
                    session_id=session_id,
                    defaults={
                        'caller_number': caller_number,
                        'destination_number': destination_number,
                        'direction': direction,
                        'status': call_status.lower(),
                        'start_time': timezone.now()
                    }
                )

                # Update existing call log if not newly created
                if not created:
                    call_log.caller_number = caller_number
                    call_log.destination_number = destination_number
                    call_log.direction = direction
                    call_log.status = call_status.lower()

                    # If call is completed, update end time and duration
                    if call_status.lower() in ['completed', 'failed', 'no-answer', 'busy']:
                        call_log.end_time = timezone.now()
                        if 'durationInSeconds' in serializer.validated_data:
                            call_log.duration = int(serializer.validated_data['durationInSeconds'])
                        else:
                            call_log.calculate_duration()

                    call_log.save()

                # Send real-time update to WebSocket
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    f'call_status_{session_id}',
                    {
                        'type': 'call_status_message',
                        'message': call_status
                    }
                )

                logger.info(f"Call status updated successfully: sessionId={session_id}, status={call_status}")
                return Response({"status": "success"}, status=status.HTTP_200_OK)

            except Exception as e:
                logger.error(f"Error updating call log: {str(e)}")
                return Response({"error": "Error updating call log"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            logger.error(f"Unexpected error processing webhook: {str(e)}")
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserCallHistoryView(APIView):
    """Get call history for current authenticated user"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Include both inbound and outbound calls
        calls = CallLog.objects.filter(
            Q(caller=user) | Q(receiver=user)
        ).order_by('-start_time')

        serializer = CallLogSerializer(calls, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class IVRHandler(APIView):
    """Handle inbound calls and return IVR response"""
    permission_classes = []

    def post(self, request):
        try:
            # Log the incoming request data
            logger.info(f"Incoming IVR request: {request.data}")

            # Respond with an IVR menu
            response = """
            <?xml version="1.0" encoding="UTF-8"?>
            <Response>
                <Say>Welcome to our service. Please hold while we connect you.</Say>
                <Dial>+254712345678</Dial>
            </Response>
            """
            return HttpResponse(response, content_type="application/xml")

        except Exception as e:
            logger.error(f"Error handling IVR request: {str(e)}")
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)