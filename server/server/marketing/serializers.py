# serializers.py
from rest_framework import serializers
from .models import Campaign, CampaignPerformance, DiscountCode

class CampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campaign
        fields = ['id', 'name', 'campaign_type', 'audience', 'subject', 'content', 'scheduled_at', 'sent_at',]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make the audience field optional
        self.fields['audience'].required = False

class CampaignPerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignPerformance
        fields = ['id', 'campaign', 'opens', 'clicks', 'conversions', 'revenue_generated']

class DiscountCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiscountCode
        fields = ['id', 'code', 'discount_percentage', 'valid_from', 'valid_to', 'usage_limit', 'times_used']