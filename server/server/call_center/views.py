import africastalking
import re
from django.conf import settings
from django.utils import timezone
from django.db.models import Q
from django.db import connection
from django.contrib.auth import get_user_model
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import CallLog, CallbackURL, PhoneNumber, QueuedCall, AgentStatus
from .serializers import (
    CallLogSerializer, CallbackURLSerializer, PhoneNumberSerializer,
    MakeCallSerializer, CallStatusSerializer, QueuedCallSerializer
)
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .tasks import update_call_log

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
                # Make the call using Africa's Talking Voice API
                response = voice.call(
                    callFrom=settings.AFRICASTALKING_CALLER_ID,
                    callTo=[phone_number]
                )
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
    permission_classes = []

    def post(self, request):
        channel_layer = get_channel_layer()
        try:
            # Log the incoming request data for debugging
            logger.info(f"Incoming webhook data: {request.data}")
            
            serializer = CallStatusSerializer(data=request.data)
            if not serializer.is_valid():
                logger.error(f"Validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            data = serializer.validated_data
            session_id = data['sessionId']
            at_number = settings.AFRICASTALKING_CALLER_ID

            # Determine call direction and participants
            if data.get('direction', '').lower() == 'outbound':
                direction = 'outbound'
                caller_number = at_number
                destination_number = data['callerNumber']
                receiver = None
            elif data['callerNumber'] != at_number:
                direction = 'inbound'
                caller_number = data['callerNumber']
                destination_number = at_number
                try:
                    receiver = PhoneNumber.objects.get(number=at_number).assigned_to
                except PhoneNumber.DoesNotExist:
                    receiver = None
            else:
                direction = 'outbound'
                caller_number = at_number
                destination_number = data.get('destinationNumber', '')
                receiver = None

            # Map call states
            call_state = data.get('callSessionState', 'unknown').lower()
            status_mapping = {
                'new': 'queued',
                'ringing': 'ringing',
                'answered': 'active',
                'completed': 'completed',
                'failed': 'failed',
                'busy': 'busy',
                'timeout': 'no-answer'
            }
            call_status = status_mapping.get(call_state, 'unknown')

            # Prepare call data for Celery task
            call_data = {
                'session_id': session_id,
                'caller_number': caller_number,
                'destination_number': destination_number,
                'direction': direction,
                'status': call_status,
                'hangup_cause': data.get('hangupCause'),
                'start_time': timezone.now().isoformat(),
                'duration': int(data['durationInSeconds']) if 'durationInSeconds' in data else None,
                'receiver_id': receiver.id if receiver else None
            }

            # Queue the database operation via Celery
            update_call_log.delay(
                session_id=call_data['session_id'],
                defaults={
                    'caller_number': call_data['caller_number'],
                    'destination_number': call_data['destination_number'],
                    'direction': call_data['direction'],
                    'status': call_data['status'],
                    'hangup_cause': call_data.get('hangup_cause'),
                    'start_time': call_data.get('start_time'),
                    'duration': call_data.get('duration'),
                    'receiver_id': call_data.get('receiver_id')
                }
            )

            # Send WebSocket notifications immediately (non-database operations)
            async_to_sync(channel_layer.group_send)(
                f'call_{session_id}',
                {
                    'type': 'call.status.update',
                    'session_id': session_id,
                    'status': call_status,
                    'direction': direction,
                    'caller_number': caller_number,
                    'timestamp': str(timezone.now()),
                    'duration': call_data.get('duration')
                }
            )

            async_to_sync(channel_layer.group_send)(
                'call_monitor',
                {
                    'type': 'call.activity',
                    'event': 'status_change',
                    'session_id': session_id,
                    'status': call_status
                }
            )

            return Response({"status": "processing"}, status=status.HTTP_202_ACCEPTED)

        except Exception as e:
            logger.error(f"Webhook processing error: {str(e)}", exc_info=True)
            async_to_sync(channel_layer.group_send)(
                'errors',
                {
                    'type': 'system.error',
                    'error': 'webhook_failure',
                    'message': str(e)
                }
            )
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

class CallerIdView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({
            'caller_id': settings.AFRICASTALKING_CALLER_ID
        })

# new views
class AnswerCallView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        session_id = request.data.get('session_id')
        try:
            # Get the call and verify the requesting user is the receiver
            call = CallLog.objects.get(
                session_id=session_id,
                receiver=request.user,
                status__in=['ringing', 'queued']
            )
            
            # Update call status
            call.status = 'active'
            call.start_time = timezone.now()
            call.save()
            
            # Notify via WebSocket
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'call_{session_id}',
                {
                    'type': 'call.answered',
                    'session_id': session_id,
                    'status': 'active'
                }
            )
            
            return Response({"status": "success"})
            
        except CallLog.DoesNotExist:
            return Response({"error": "Call not found or unauthorized"}, status=404)
        except Exception as e:
            logger.error(f"Error answering call: {str(e)}")
            return Response({"error": "Internal server error"}, status=500)

class EndCallView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        session_id = request.data.get('session_id')
        try:
            call = CallLog.objects.get(
                Q(session_id=session_id) & 
                (Q(caller=request.user) | Q(receiver=request.user)),
                status__in=['active', 'ringing']
            )
            
            # Update call status
            call.status = 'completed'
            call.end_time = timezone.now()
            if call.start_time:
                call.duration = (call.end_time - call.start_time).seconds
            call.save()
            
            # Notify via WebSocket
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'call_{session_id}',
                {
                    'type': 'call.ended',
                    'session_id': session_id,
                    'status': 'completed'
                }
            )
            
            return Response({"status": "success"})
            
        except CallLog.DoesNotExist:
            return Response({"error": "Call not found or unauthorized"}, status=404)
        except Exception as e:
            logger.error(f"Error ending call: {str(e)}")
            return Response({"error": "Internal server error"}, status=500)

class IncomingCallsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        calls = CallLog.objects.filter(
            direction='inbound',
            receiver=request.user
        ).order_by('-start_time')
        serializer = CallLogSerializer(calls, many=True)
        return Response(serializer.data)
    
class CallQueueView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        waiting_calls = QueuedCall.objects.filter(status='waiting').order_by('timestamp')
        serializer = QueuedCallSerializer(waiting_calls, many=True) 
        return Response(serializer.data)

class AgentStatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        is_available = request.data.get('is_available', True)
        AgentStatus.objects.update_or_create(
            user=request.user,
            defaults={'is_available': is_available}
        )
        return Response({"status": "success"})
    
class IVRHandler(APIView):
    def post(self, request):
        response = """<?xml version="1.0"?>
        <Response>
            <Dial phoneNumbers="+254705479844" record="false"/>
        </Response>"""
        return HttpResponse(response, content_type="application/xml")  

# class IVRHandler(APIView):
#     def post(self, request):
#         logger.info(f"Raw IVR request data: {request.data}")
#         try:
#             data = request.data
#             logger.info(f"Processed IVR data: {data}")
#             caller_number = data.get('callerNumber')
#             session_id = data.get('sessionId')
            
#             # First check if this call is already in queue
#             if QueuedCall.objects.filter(session_id=session_id).exists():
#                 return HttpResponse("""<Response><Reject/></Response>""", content_type="application/xml")
            
#             # Check if agents are available
#             available_agents = AgentStatus.objects.filter(is_available=True)
            
#             if available_agents.exists():
#                 # Route to available agent
#                 agent = available_agents.first()
#                 response = f"""<?xml version="1.0"?>
#                 <Response>
#                     <Dial phoneNumbers="{agent.user.phone_numbers.first().number}" record="true"/>
#                 </Response>"""
#             else:
#                 # Add to queue
#                 QueuedCall.objects.create(
#                     session_id=session_id,
#                     caller_number=caller_number
#                 )
#                 response = """<?xml version="1.0"?>
#                 <Response>
#                     <Say>All our agents are busy. Please hold.</Say>
#                     <Play>waiting_music.mp3</Play>
#                 </Response>"""
                
#             return HttpResponse(response, content_type="application/xml")
            
#         except Exception as e:
#             logger.error(f"IVR error: {str(e)}")
#             return HttpResponse("""<Response><Reject/></Response>""", content_type="application/xml")

# redirects call to the specified number i.e. +254705479844 in this case
# class IVRHandler(APIView):
#     def post(self, request):
#         is_active = request.data.get('isActive') == '1'

#         if is_active:
#             response = """<?xml version="1.0"?>
#             <Response>
#                 <Dial phoneNumbers="+254705479844" sequential="true"/>
#             </Response>"""
#         else:
#             response = """<?xml version="1.0"?>
#             <Response>
#                 <Reject reason="busy"/>
#             </Response>"""
#         return HttpResponse(response, content_type="application/xml")
