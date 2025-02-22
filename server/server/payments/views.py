import json
import uuid
from decouple import config
import requests
from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Payment, PaymentWebhookLog
from .serializers import PaymentSerializer, PaymentInitializeSerializer
from ecommerce.models import Cart, Order

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
                "callback_url": config('PAYMENT_CALLBACK_URL')
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

    @action(detail=False, methods=['get'], url_path='verify/(?P<reference>[^/.]+)')
    def verify_payment(self, request, reference):
        try:
            payment = Payment.objects.get(reference=reference)
            
            # Verify on Paystack
            url = f"https://api.paystack.co/transaction/verify/{reference}"
            headers = {
                "Authorization": f"Bearer {config('PAYSTACK_SECRET_KEY')}"
            }
            
            response = requests.get(url, headers=headers)
            response_data = response.json()

            if response_data['status']:
                if response_data['data']['status'] == 'success':
                    # Update payment and order status
                    payment.status = 'success'
                    payment.paystack_payment_id = response_data['data']['id']
                    payment.save()
                    
                    payment.order.status = 'pending'  # Order status changes to pending after successful payment
                    payment.order.save()
                    
                    # Clear the cart
                    Cart.objects.filter(user=request.user).delete()
                    
                    return Response({"status": "Payment verified successfully"})
            
            return Response(
                {"error": "Payment verification failed"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except Payment.DoesNotExist:
            return Response(
                {"error": "Payment not found"},
                status=status.HTTP_404_NOT_FOUND
            )

    @method_decorator(csrf_exempt)
    @action(detail=False, methods=['post'], url_path='webhook', permission_classes=[])
    def webhook(self, request):
        # Verify webhook signature
        paystack_signature = request.headers.get('x-paystack-signature')
        
        if not paystack_signature:
            return HttpResponse(status=400)

        # Log webhook
        payload = json.loads(request.body)
        PaymentWebhookLog.objects.create(
            payload=payload,
            event_type=payload.get('event'),
            reference=payload.get('data', {}).get('reference', '')
        )

        # Process webhook
        if payload['event'] == 'charge.success':
            reference = payload['data']['reference']
            try:
                payment = Payment.objects.get(reference=reference)
                payment.status = 'success'
                payment.paystack_payment_id = payload['data']['id']
                payment.save()
                
                # Update order status
                payment.order.status = 'pending'
                payment.order.save()
                
            except Payment.DoesNotExist:
                pass

        return HttpResponse(status=200)