from rest_framework import serializers
from .models import CxClient
from django.contrib.auth.models import User

class CxClientSerializer(serializers.ModelSerializer):
    account_manager = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(groups__name="Account Managers"),  # Only allow Account Managers
        required=False,
        allow_null=True
    )

    class Meta:
        model = CxClient
        fields = '__all__'
