from django.db import models
from auth_app.models import CxClient
from django.contrib.auth.models import User

class CxPipeline(models.Model):
    STATUS_CHOICES = [
        (1, "Lead/Prospect"),
        (2, "Negotiation"),
        (3, "Onboarding"),
        (4, "Active Engagement"),
        (5, "Renewal/Closure"),
    ]

    client = models.ForeignKey(CxClient, on_delete=models.CASCADE, related_name="pipelines")
    status = models.IntegerField(choices=STATUS_CHOICES, default=1)  # Changed to IntegerField
    notes = models.TextField(blank=True, null=True)
    last_updated = models.DateTimeField(auto_now=True)
    account_manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="managed_pipelines")

    def __str__(self):
        return f"{self.client.name} - {self.get_status_display()}"