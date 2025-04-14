from django.db import models, IntegrityError
from django.contrib.auth.models import User
from django.utils import timezone
import uuid
import logging
logger = logging.getLogger(__name__)

def generate_session_id():
    return str(uuid.uuid4())

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
    session_id = models.CharField(max_length=100, unique=True) 
    caller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='initiated_calls', null=True, blank=True)
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_calls', null=True, blank=True)
    caller_number = models.CharField(max_length=20) 
    destination_number = models.CharField(max_length=20) 
    direction = models.CharField(max_length=10, choices=DIRECTION_CHOICES, default='outbound') 
    start_time = models.DateTimeField(default=timezone.now)
    end_time = models.DateTimeField(null=True, blank=True)
    duration = models.IntegerField(null=True, blank=True, help_text='Duration in seconds') 
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='queued') 
    hangup_cause = models.CharField(max_length=50, choices=HANGUP_CAUSES, null=True, blank=True) 
    currency_code = models.CharField(max_length=10, null=True, blank=True) 
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True) 
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
    
class QueuedCall(models.Model):
    session_id = models.CharField(
        max_length=100,
        unique=True,
        blank=False,
        null=False,
        default=generate_session_id,  # Using named function instead of lambda
        help_text="Unique call session identifier"
    )
    caller_number = models.CharField(
        max_length=20,
        blank=True,
        default='unknown_caller',
        help_text="Caller's phone number"
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        help_text="When the call was queued"
    )
    status = models.CharField(
        max_length=20,
        default='waiting',
        choices=[
            ('waiting', 'Waiting'),
            ('processing', 'Processing'),
            ('completed', 'Completed'),
            ('failed', 'Failed')
        ],
        help_text="Current status of the queued call"
    )
    
    class Meta:
        verbose_name = "Queued Call"
        verbose_name_plural = "Queued Calls"
        ordering = ['timestamp']
        indexes = [
            models.Index(fields=['session_id']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.caller_number} - {self.status}"

    @classmethod
    def create_queued_call(cls, session_id=None, caller_number=None):
        """Safe method to create queued calls with validation"""
        try:
            return cls.objects.create(
                session_id=session_id or generate_session_id(),
                caller_number=caller_number or 'unknown_caller'
            )
        except IntegrityError:
            logger.warning(f"Duplicate session_id detected: {session_id}")
            return cls.objects.filter(session_id=session_id).first()
    
class AgentStatus(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    is_available = models.BooleanField(default=True)
    last_active = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {'Available' if self.is_available else 'Busy'}"
