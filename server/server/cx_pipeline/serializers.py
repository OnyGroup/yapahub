from rest_framework import serializers
from .models import CxPipeline, PipelineStage

class PipelineStageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PipelineStage
        fields = '__all__'

class CxPipelineSerializer(serializers.ModelSerializer):
    client_name = serializers.ReadOnlyField(source="client.name")
    account_manager_name = serializers.ReadOnlyField(source="account_manager.username")

    class Meta:
        model = CxPipeline
        fields = '__all__'
