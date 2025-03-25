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

    HANGUP_CAUSES = (
        ('NORMAL_CLEARING', 'Normal Clearing'),
        ('CALL_REJECTED', 'Call Rejected'),
        ('NO_ANSWER', 'No Answer'),
        ('USER_BUSY', 'User Busy'),
        ('UNALLOCATED_NUMBER', 'Unallocated Number'),
        ('ORIGINATOR_CANCEL', 'Originator Cancel'),
        ('LOSE_RACE', 'Lose Race'),
        ('SERVICE_UNAVAILABLE', 'Service Unavailable'),
        ('UNSPECIFIED', 'Unspecified'),
    )

    # Core fields
    session_id = models.CharField(max_length=100, unique=True)  # Matches sessionId from API
    caller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='initiated_calls')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_calls', null=True, blank=True)
    caller_number = models.CharField(max_length=20)  # Matches callerNumber from API
    destination_number = models.CharField(max_length=20)  # Matches destinationNumber from API
    direction = models.CharField(max_length=10, choices=DIRECTION_CHOICES, default='outbound')  # Matches direction from API
    start_time = models.DateTimeField(default=timezone.now)  # Matches callStartTime from API
    end_time = models.DateTimeField(null=True, blank=True)
    duration = models.IntegerField(null=True, blank=True, help_text='Duration in seconds')  # Matches durationInSeconds from API
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='queued')  # Matches callSessionState from API
    hangup_cause = models.CharField(max_length=50, choices=HANGUP_CAUSES, null=True, blank=True)  # Matches hangupCause from API
    currency_code = models.CharField(max_length=10, null=True, blank=True)  # Matches currencyCode from API
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # Matches amount from API
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.session_id} - {self.caller.username} to {self.destination_number}"

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
