import africastalking
import re
from django.conf import settings
from django.utils import timezone
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
from .sip_client import SIPClient
import uuid
from datetime import datetime

User = get_user_model()
africastalking.initialize(settings.AFRICASTALKING_USERNAME, settings.AFRICASTALKING_API_KEY)
voice = africastalking.Voice

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
            use_sip = serializer.validated_data.get('use_sip', False)  # Optional SIP flag

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
                    # return Response(
                    #     {"error": "No active callback URL configured"},
                    #     status=status.HTTP_400_BAD_REQUEST
                    # )

                # **SIP CALL LOGIC**
                if use_sip:
                    try:
                        sip_client = SIPClient()
                        sip_client.make_call(phone_number)

                        # Generate a unique session ID with timestamp
                        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
                        unique_session_id = f"SIP-{phone_number}-{timestamp}-{uuid.uuid4().hex[:8]}"

                        call_log = CallLog.objects.create(
                            session_id=unique_session_id,
                            phone_number=phone_number,
                            status="initiated_sip",
                            caller=request.user  # set the caller
                        )

                        return Response({
                            "message": "SIP Call initiated successfully",
                            "call_id": call_log.id,
                            "session_id": call_log.session_id
                        }, status=status.HTTP_201_CREATED)

                    except Exception as e:
                        return Response({"error": f"SIP call failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                # **AFRICA'S TALKING CALL LOGIC**
                try:
                    print(f"Making call with: {phone_number}")  # Debugging
                    response = africastalking.Voice.call(
                        callFrom=settings.AFRICASTALKING_CALLER_ID,  
                        callTo=phone_number
                    )
                    print(f"API Response: {response}")  # Debugging
                except Exception as e:
                    print(f"Error making call: {str(e)}")
                    return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                # **LOG CALL**
                call_log = CallLog.objects.create(
                    session_id=response['entries'][0]['sessionId'],
                    phone_number=phone_number,
                    status="queued",
                    caller=request.user 
                )

                return Response({
                    "message": "Call initiated successfully via Africa's Talking",
                    "call_id": call_log.id,
                    "session_id": call_log.session_id
                }, status=status.HTTP_201_CREATED)

            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CallStatusWebhook(APIView):
    """Webhook to receive call status updates from Africa's Talking"""
    permission_classes = []  # No authentication for webhook
    
    def post(self, request):
        serializer = CallStatusSerializer(data=request.data)
        if serializer.is_valid():
            session_id = serializer.validated_data['sessionId']
            call_status = serializer.validated_data['status']
            
            try:
                call_log = CallLog.objects.get(session_id=session_id)
                call_log.status = call_status.lower()
                
                # If call is completed, update end time and duration
                if call_status.lower() in ['completed', 'failed', 'no-answer', 'busy']:
                    call_log.end_time = timezone.now()
                    if serializer.validated_data.get('duration'):
                        call_log.duration = serializer.validated_data.get('duration')
                    else:
                        call_log.calculate_duration()
                
                call_log.save()
                return Response({"status": "success"}, status=status.HTTP_200_OK)
                
            except CallLog.DoesNotExist:
                return Response(
                    {"error": "Call session not found"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserCallHistoryView(APIView):
    """Get call history for current authenticated user"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        calls = CallLog.objects.filter(caller=user).order_by('-start_time')
        serializer = CallLogSerializer(calls, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)