from django.http import HttpResponse
from django.shortcuts import redirect
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from decouple import config
import requests
import hmac
import hashlib
import json
import uuid
from ecommerce.models import Cart, Order
from .models import Payment, PaymentWebhookLog
from .serializers import PaymentSerializer, PaymentInitializeSerializer

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(order__user=self.request.user)

    @action(detail=False, methods=['post'], url_path='initialize')
    def initialize_payment(self, request):
        serializer = PaymentInitializeSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            # Create payment record
            payment = serializer.save()
            
            # Generate unique reference
            reference = f"PAY-{uuid.uuid4().hex[:8]}"
            payment.reference = reference
            payment.save()

            # Initialize Paystack payment
            url = "https://api.paystack.co/transaction/initialize"
            headers = {
                "Authorization": f"Bearer {config('PAYSTACK_SECRET_KEY')}",
                "Content-Type": "application/json"
            }
            data = {
                "email": payment.email,
                "amount": int(payment.amount * 100),  # Convert to kobo
                "reference": payment.reference,
                "callback_url": f"{config('BACKEND_URL', 'http://localhost:8000')}/payments/verify/",
                "channels": ["card", "bank", "ussd"],  # Enable different payment methods
            }

            try:
                response = requests.post(url, headers=headers, json=data)
                response_data = response.json()

                if response_data['status']:
                    return Response({
                        "authorization_url": response_data['data']['authorization_url'],
                        "reference": payment.reference
                    })
                return Response(
                    {"error": "Failed to initialize payment"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except Exception as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def paystack_webhook(request):
    # Verify webhook signature
    paystack_secret = config('PAYSTACK_SECRET_KEY').encode('utf-8')
    paystack_signature = request.headers.get('x-paystack-signature')
    request_body = request.body.decode('utf-8')

    if not paystack_signature:
        return HttpResponse(status=400)

    # Generate HMAC SHA512 signature
    expected_signature = hmac.new(
        paystack_secret,
        request_body.encode('utf-8'),
        hashlib.sha512
    ).hexdigest()

    # Compare signatures securely
    if not hmac.compare_digest(expected_signature, paystack_signature):
        return HttpResponse(status=403)

    try:
        payload = json.loads(request_body)
    except json.JSONDecodeError:
        return HttpResponse(status=400)

    # Log webhook event
    PaymentWebhookLog.objects.create(
        payload=payload,
        event_type=payload.get('event'),
        reference=payload.get('data', {}).get('reference', '')
    )

    # Process payment success event
    if payload['event'] == 'charge.success':
        reference = payload['data']['reference']
        try:
            payment = Payment.objects.get(reference=reference)

            if payment.status == 'success':
                return HttpResponse(status=200)

            payment.status = 'success'
            payment.paystack_payment_id = payload['data']['id']
            payment.save()

            payment.order.status = 'pending'
            payment.order.save()

        except Payment.DoesNotExist:
            return HttpResponse(status=404)

    return HttpResponse(status=200)

@api_view(['GET'])
@permission_classes([AllowAny])
def verify_payment(request):
    reference = request.GET.get('reference') or request.GET.get('trxref')
    if not reference:
        return Response({'error': 'No reference provided'}, status=400)

    try:
        url = f"https://api.paystack.co/transaction/verify/{reference}"
        headers = {
            "Authorization": f"Bearer {config('PAYSTACK_SECRET_KEY')}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(url, headers=headers)
        response_data = response.json()

        if response_data['status']:
            try:
                payment = Payment.objects.get(reference=reference)
                
                if response_data['data']['status'] == 'success':
                    payment.status = 'success'
                    payment.paystack_payment_id = response_data['data']['id']
                    payment.save()

                    payment.order.status = 'pending'
                    payment.order.save()

                    # Get the frontend URL from environment variables
                    frontend_success_url = config('FRONTEND_SUCCESS_URL', default='http://localhost:3000/payment/success')
                    
                    # Perform redirect to frontend
                    return redirect(f"{frontend_success_url}?reference={reference}")
                    
                return Response({
                    'status': 'failed',
                    'message': 'Payment verification failed'
                }, status=400)

            except Payment.DoesNotExist:
                return Response({
                    'status': 'failed',
                    'message': 'Payment not found'
                }, status=404)

        return Response({
            'status': 'failed',
            'message': 'Unable to verify payment'
        }, status=400)

    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=500)