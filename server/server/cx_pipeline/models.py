from django.db import models
from auth_app.models import CxClient
from django.contrib.auth.models import User

class PipelineStage(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class CxPipeline(models.Model):
    client = models.ForeignKey(CxClient, on_delete=models.CASCADE, related_name="pipelines")
    current_stage = models.ForeignKey(PipelineStage, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=50, choices=[('in_progress', 'In Progress'), ('completed', 'Completed'), ('stalled', 'Stalled')], default='in_progress')
    notes = models.TextField(blank=True, null=True)
    last_updated = models.DateTimeField(auto_now=True)
    account_manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="managed_pipelines")

    def __str__(self):
        return f"{self.client.name} - {self.current_stage.name if self.current_stage else 'No Stage'}"
