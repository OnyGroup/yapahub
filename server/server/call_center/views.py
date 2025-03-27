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

            if not re.match(r'^\+\d{10,15}$', phone_number):
                return Response(
                    {"error": "Invalid phone number format. Use E.164 format like +254700123456"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                call_kwargs = {
                    'callFrom': settings.AFRICASTALKING_CALLER_ID,
                    'callTo': [phone_number]
                }
                
                # Add callback URL based on SDK version
                if hasattr(voice.call, 'callbackUrl'):
                    call_kwargs['callbackUrl'] = settings.CALLBACK_URL
                elif hasattr(voice.call, 'callback_url'):
                    call_kwargs['callback_url'] = settings.CALLBACK_URL
                else:
                    logger.warning("Callback URL parameter not found in SDK")

                response = voice.call(**call_kwargs)
                logger.info(f"Africa's Talking API response: {response}")

                # Log the outbound call
                call_log = CallLog.objects.create(
                    session_id=response['entries'][0]['sessionId'],
                    caller_number=settings.AFRICASTALKING_CALLER_ID,
                    destination_number=phone_number,
                    direction='outbound',
                    status="queued",
                    caller=request.user
                )

                return Response({
                    "message": "Call initiated successfully",
                    "session_id": call_log.session_id
                }, status=status.HTTP_200_OK)

            except Exception as e:
                logger.error(f"Error initiating call: {str(e)}")
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CallStatusWebhook(APIView):
    """Webhook to receive call status updates from Africa's Talking"""
    permission_classes = []

    def post(self, request):
        try:
            logger.info(f"Incoming webhook data: {request.data}")
            serializer = CallStatusSerializer(data=request.data)
            if not serializer.is_valid():
                logger.error(f"Validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            data = serializer.validated_data
            session_id = data['sessionId']
            at_number = settings.AFRICASTALKING_CALLER_ID

            # Determine direction and numbers
            if data.get('direction', '').lower() == 'outbound':
                direction = 'outbound'
                caller_number = at_number
                destination_number = data['callerNumber']
                receiver = None
            elif data['callerNumber'] != at_number:
                direction = 'inbound'
                caller_number = data['callerNumber']
                destination_number = at_number
                # Find which user this AT number is assigned to
                try:
                    receiver = PhoneNumber.objects.get(number=at_number).assigned_to
                except PhoneNumber.DoesNotExist:
                    receiver = None
            else:
                direction = 'outbound'
                caller_number = at_number
                destination_number = data.get('destinationNumber', '')
                receiver = None

            # Prepare defaults for call log
            defaults = {
                'caller_number': caller_number,
                'destination_number': destination_number,
                'direction': direction,
                'status': data.get('callSessionState', 'unknown').lower(),
                'hangup_cause': data.get('hangupCause'),
                'start_time': timezone.now()
            }
            
            # Set receiver for inbound calls
            if direction == 'inbound':
                defaults['receiver'] = receiver

            # Update or create call log
            call_log, created = CallLog.objects.update_or_create(
                session_id=session_id,
                defaults=defaults
            )

            # Update end time if call completed
            if call_log.status in ['completed', 'failed', 'no-answer', 'busy']:
                call_log.end_time = timezone.now()
                if 'durationInSeconds' in data:
                    call_log.duration = int(data['durationInSeconds'])
                call_log.save()

            # WebSocket notification
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'call_status_{session_id}',
                {
                    'type': 'call_status_message',
                    'message': {
                        'status': call_log.status,
                        'direction': direction,
                        'session_id': session_id
                    }
                }
            )

            return Response({"status": "success"}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error in webhook: {str(e)}", exc_info=True)
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserCallHistoryView(APIView):
    """Get call history for current authenticated user"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Get all phone numbers assigned to this user
        user_phone_numbers = PhoneNumber.objects.filter(
            assigned_to=user
        ).values_list('number', flat=True)
        
        # Get the primary AT number assigned to user
        at_number_assigned = settings.AFRICASTALKING_CALLER_ID in user_phone_numbers

        # Build the query
        query = Q(caller=user) | Q(receiver=user)
        
        # If user owns the AT number, include all calls to/from that number
        if at_number_assigned:
            query |= Q(caller_number=settings.AFRICASTALKING_CALLER_ID)
            query |= Q(destination_number=settings.AFRICASTALKING_CALLER_ID)
        else:
            # Otherwise just include calls involving their other numbers
            query |= Q(caller_number__in=user_phone_numbers)
            query |= Q(destination_number__in=user_phone_numbers)

        calls = CallLog.objects.filter(query).order_by('-start_time')
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