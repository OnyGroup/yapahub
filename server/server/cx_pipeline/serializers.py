from rest_framework import serializers
from .models import CxPipeline, PipelineStage

class PipelineStageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PipelineStage
        fields = '__all__'

class CxPipelineSerializer(serializers.ModelSerializer):
    client_name = serializers.ReadOnlyField(source="client.name")
    account_manager_name = serializers.SerializerMethodField()

    class Meta:
        model = CxPipeline
        fields = '__all__'

    def get_account_manager_name(self, obj):
        if obj.account_manager:
            full_name = f"{obj.account_manager.first_name} {obj.account_manager.last_name}".strip()
            return full_name if full_name else obj.account_manager.username  # Fallback if names are empty
        return None
