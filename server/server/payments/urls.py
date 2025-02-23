from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet, verify_payment, paystack_webhook

router = DefaultRouter()
router.register(r'', PaymentViewSet)

urlpatterns = [
    path('verify/', verify_payment, name='verify_payment'),
    path('webhook/', paystack_webhook, name='paystack_webhook'),
    path('', include(router.urls)),  # Move this to the end
]