from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class CallLog(models.Model):
    STATUS_CHOICES = (
        ('queued', 'Queued'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('no-answer', 'No Answer'),
        ('busy', 'Busy'),
    )

    DIRECTION_CHOICES = (
        ('inbound', 'Inbound'),
        ('outbound', 'Outbound'),
    )

    session_id = models.CharField(max_length=100, unique=True)
    caller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='initiated_calls')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_calls', null=True, blank=True)
    phone_number = models.CharField(max_length=20)
    direction = models.CharField(max_length=10, choices=DIRECTION_CHOICES, default='outbound')
    start_time = models.DateTimeField(default=timezone.now)
    end_time = models.DateTimeField(null=True, blank=True)
    duration = models.IntegerField(null=True, blank=True, help_text='Duration in seconds')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='queued')
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.session_id} - {self.caller.username} to {self.phone_number}"

    def calculate_duration(self):
        if self.end_time and self.start_time:
            duration_seconds = (self.end_time - self.start_time).total_seconds()
            self.duration = int(duration_seconds)
            return self.duration
        return None

class CallbackURL(models.Model):
    """Store callback URLs for Africa's Talking API webhooks"""
    name = models.CharField(max_length=100)
    url = models.URLField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class PhoneNumber(models.Model):
    """Store phone numbers for the call center"""
    number = models.CharField(max_length=20, unique=True)
    is_active = models.BooleanField(default=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_numbers')
    description = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.number