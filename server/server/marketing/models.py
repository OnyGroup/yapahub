from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now

class Campaign(models.Model):
    CAMPAIGN_TYPES = [
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('push', 'Push Notification'),
    ]
    name = models.CharField(max_length=255)
    campaign_type = models.CharField(max_length=10, choices=CAMPAIGN_TYPES)
    audience = models.ManyToManyField(User, related_name='campaigns')
    subject = models.CharField(max_length=255, blank=True, null=True)
    content = models.TextField()
    scheduled_at = models.DateTimeField(default=now)
    sent_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class CampaignPerformance(models.Model):
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='performance')
    opens = models.PositiveIntegerField(default=0)
    clicks = models.PositiveIntegerField(default=0)
    conversions = models.PositiveIntegerField(default=0)
    revenue_generated = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"Performance for {self.campaign.name}"


class DiscountCode(models.Model):
    code = models.CharField(max_length=50, unique=True)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()
    usage_limit = models.PositiveIntegerField()
    times_used = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.code