from django.db import models
from auth_app.models import CxClient
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

class PipelineStage(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    is_default = models.BooleanField(default=False)
    expected_duration_days = models.PositiveIntegerField(default=7, help_text="Expected number of days to complete this stage")
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="created_stages")

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name

class StageTransition(models.Model):
    pipeline = models.ForeignKey('CxPipeline', on_delete=models.CASCADE, related_name="transitions")
    from_stage = models.ForeignKey(PipelineStage, on_delete=models.SET_NULL, null=True, related_name="transitions_from", blank=True)
    to_stage = models.ForeignKey(PipelineStage, on_delete=models.SET_NULL, null=True, related_name="transitions_to")
    entry_date = models.DateTimeField(default=timezone.now)
    exit_date = models.DateTimeField(null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="stage_transitions")
    
    class Meta:
        ordering = ['-entry_date']
    
    @property
    def duration(self):
        """Returns the duration spent in this stage in days"""
        if not self.exit_date:
            # If still in this stage, calculate duration until now
            return (timezone.now() - self.entry_date).days
        return (self.exit_date - self.entry_date).days
    
    @property
    def duration_str(self):
        """Returns a human-readable duration string"""
        days = self.duration
        if days < 1:
            hours = (timezone.now() - self.entry_date).total_seconds() / 3600 if not self.exit_date else (self.exit_date - self.entry_date).total_seconds() / 3600
            return f"{int(hours)} hours"
        return f"{days} days"
    
    @property
    def is_active(self):
        """Returns whether this is the current active stage"""
        return self.exit_date is None
    
    @property
    def is_overdue(self):
        """Returns whether this stage has exceeded its expected duration"""
        if not self.to_stage or not self.to_stage.expected_duration_days:
            return False
        return self.duration > self.to_stage.expected_duration_days
    
    def __str__(self):
        from_stage_name = self.from_stage.name if self.from_stage else "Initial"
        to_stage_name = self.to_stage.name if self.to_stage else "Unknown"
        return f"{self.pipeline.client.name}: {from_stage_name} → {to_stage_name}"

class CxPipeline(models.Model):
    # Legacy status field for backward compatibility
    STATUS_CHOICES = [
        (1, "Lead/Prospect"),
        (2, "Negotiation"),
        (3, "Onboarding"),
        (4, "Active Engagement"),
        (5, "Renewal/Closure"),
    ]
    
    client = models.ForeignKey(CxClient, on_delete=models.CASCADE, related_name="pipelines")
    # Keep the original status field for backward compatibility
    status = models.IntegerField(choices=STATUS_CHOICES, default=1)
    # Add the new stage field for custom pipeline stages
    stage = models.ForeignKey(PipelineStage, on_delete=models.SET_NULL, null=True, related_name="pipelines")
    notes = models.TextField(blank=True, null=True)
    last_updated = models.DateTimeField(auto_now=True)
    account_manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="managed_pipelines")
    stage_start_date = models.DateTimeField(default=timezone.now, help_text="Date when the current stage was entered")
    
    def __str__(self):
        if self.stage:
            return f"{self.client.name} - {self.stage.name}"
        return f"{self.client.name} - {self.get_status_display()}"
    
    @property
    def current_stage_duration_days(self):
        """Returns the number of days in the current stage"""
        return (timezone.now() - self.stage_start_date).days
    
    @property
    def is_stage_overdue(self):
        """Returns whether the current stage is overdue based on expected duration"""
        if not self.stage or not self.stage.expected_duration_days:
            return False
        return self.current_stage_duration_days > self.stage.expected_duration_days

    def save(self, *args, **kwargs):
        # Get user from kwargs if available
        user = kwargs.pop('user', None)
        creating = self.pk is None
        
        if not creating:
            old_instance = CxPipeline.objects.get(pk=self.pk)
            old_stage = old_instance.stage
            
            # Track stage change in PipelineActivity and StageTransition
            if self.stage != old_stage:
                # Create activity record
                PipelineActivity.objects.create(
                    pipeline=self,
                    user=user,
                    activity_type='stage_change',
                    old_value=old_stage.name if old_stage else str(old_instance.get_status_display()),
                    new_value=self.stage.name if self.stage else str(self.get_status_display()),
                )
                
                # Close the previous transition
                active_transitions = self.transitions.filter(exit_date=None)
                for transition in active_transitions:
                    transition.exit_date = timezone.now()
                    transition.save()
                
                # Create a new transition
                StageTransition.objects.create(
                    pipeline=self,
                    from_stage=old_stage,
                    to_stage=self.stage,
                    user=user,
                    entry_date=timezone.now()
                )
                
                # Update stage_start_date
                self.stage_start_date = timezone.now()
        else:
            # For new pipelines, create the initial transition
            self.stage_start_date = timezone.now()
            
        super().save(*args, **kwargs)
        
        # Create initial transition for new pipelines (needs to happen after save for new pipelines)
        if creating and self.stage:
            StageTransition.objects.create(
                pipeline=self,
                from_stage=None,  # Initial stage has no from_stage
                to_stage=self.stage,
                user=user,
                entry_date=timezone.now()
            )

class PipelineActivity(models.Model):
    ACTIVITY_TYPES = [
        ('stage_change', 'Stage Change'),
        ('note_added', 'Note Added'),
        ('manager_change', 'Manager Change'),
        ('custom', 'Custom Activity'),
    ]
    
    pipeline = models.ForeignKey(CxPipeline, on_delete=models.CASCADE, related_name="activities")
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="pipeline_activities")
    timestamp = models.DateTimeField(default=timezone.now)
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    description = models.TextField(blank=True, null=True)
    old_value = models.CharField(max_length=255, blank=True, null=True)
    new_value = models.CharField(max_length=255, blank=True, null=True)
    
    class Meta:
        ordering = ['-timestamp']
        
    def __str__(self):
        return f"{self.pipeline.client.name} - {self.activity_type} - {self.timestamp.strftime('%Y-%m-%d %H:%M')}"
