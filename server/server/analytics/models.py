from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now

class Product(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name

class Sale(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='sales')
    quantity = models.PositiveIntegerField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    customer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='sales')  # Add related_name
    timestamp = models.DateTimeField(default=now)

    def __str__(self):
        return f"Sale of {self.product.name} ({self.quantity})"

    def save(self, *args, **kwargs):
        # Automatically calculate total_price if it's not set
        if not self.total_price:
            self.total_price = self.product.price * self.quantity
        super().save(*args, **kwargs)

class CustomerActivity(models.Model):
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    action = models.CharField(max_length=255)  # e.g., "Purchase", "Signup", "Refund"
    timestamp = models.DateTimeField(default=now)

    def __str__(self):
        return f"{self.customer.username} - {self.action}"