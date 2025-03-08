from django.db import models
from auth_app.models import CxClient
from django.contrib.auth.models import User
from django.utils import timezone


class PipelineStage(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="created_stages")

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name


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
    
    def __str__(self):
        if self.stage:
            return f"{self.client.name} - {self.stage.name}"
        return f"{self.client.name} - {self.get_status_display()}"

    def save(self, *args, **kwargs):
        # Create PipelineActivity when stage changes
        creating = self.pk is None
        
        if not creating:
            old_instance = CxPipeline.objects.get(pk=self.pk)
            old_stage = old_instance.stage
            
            # Track stage change in PipelineActivity
            if self.stage != old_stage:
                PipelineActivity.objects.create(
                    pipeline=self,
                    user=kwargs.pop('user', None),
                    activity_type='stage_change',
                    old_value=old_stage.name if old_stage else str(old_instance.get_status_display()),
                    new_value=self.stage.name if self.stage else str(self.get_status_display()),
                )
                
        super().save(*args, **kwargs)


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