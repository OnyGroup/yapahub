from django.db import models
from django.conf import settings
from ecommerce.models import Order

class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed')
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reference = models.CharField(max_length=200, unique=True)
    paystack_payment_id = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment {self.reference} for Order #{self.order.id}"

class PaymentWebhookLog(models.Model):
    """Log all webhook events from Paystack"""
    payload = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    event_type = models.CharField(max_length=100)
    reference = models.CharField(max_length=200)
    processed = models.BooleanField(default=False)

    def __str__(self):
        return f"Webhook event {self.event_type} - {self.reference}"