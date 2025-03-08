from rest_framework import serializers
from .models import CxPipeline, PipelineStage, PipelineActivity


class PipelineStageSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = PipelineStage
        fields = '__all__'
        
    def get_created_by_name(self, obj):
        if obj.created_by:
            full_name = f"{obj.created_by.first_name} {obj.created_by.last_name}".strip()
            return full_name if full_name else obj.created_by.username
        return None


class PipelineActivitySerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = PipelineActivity
        fields = '__all__'
        read_only_fields = ['timestamp']
        
    def get_user_name(self, obj):
        if obj.user:
            full_name = f"{obj.user.first_name} {obj.user.last_name}".strip()
            return full_name if full_name else obj.user.username
        return None


class CxPipelineSerializer(serializers.ModelSerializer):
    client_name = serializers.ReadOnlyField(source="client.name")
    account_manager_name = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()  # Human-readable status
    stage_name = serializers.ReadOnlyField(source="stage.name", default=None)
    notes = serializers.CharField(allow_blank=True, required=False, max_length=2000)
    recent_activities = serializers.SerializerMethodField()
    
    class Meta:
        model = CxPipeline
        fields = '__all__'
    
    def get_account_manager_name(self, obj):
        if obj.account_manager:
            full_name = f"{obj.account_manager.first_name} {obj.account_manager.last_name}".strip()
            return full_name if full_name else obj.account_manager.username  # Fallback if names are empty
        return None
    
    def get_status_display(self, obj):
        return obj.get_status_display()  # Returns "Lead/Prospect", "Negotiation", etc.
    
    def get_recent_activities(self, obj):
        # Get the 5 most recent activities
        activities = obj.activities.all()[:5]
        return PipelineActivitySerializer(activities, many=True).data
    
    def create(self, validated_data):
        user = self.context['request'].user
        pipeline = super().create(validated_data)
        
        # Record creation activity
        PipelineActivity.objects.create(
            pipeline=pipeline,
            user=user,
            activity_type='custom',
            description='Pipeline created',
        )
        
        return pipeline
    
    def update(self, instance, validated_data):
        user = self.context['request'].user
        
        # Track changes in notes
        if 'notes' in validated_data and validated_data['notes'] != instance.notes:
            PipelineActivity.objects.create(
                pipeline=instance,
                user=user,
                activity_type='note_added',
                description='Notes updated',
                old_value=instance.notes[:100] + '...' if len(instance.notes or '') > 100 else instance.notes,
                new_value=validated_data['notes'][:100] + '...' if len(validated_data['notes'] or '') > 100 else validated_data['notes'],
            )
        
        # Track changes in account manager
        if 'account_manager' in validated_data and validated_data['account_manager'] != instance.account_manager:
            old_manager = f"{instance.account_manager.first_name} {instance.account_manager.last_name}".strip() if instance.account_manager else "None"
            new_manager = f"{validated_data['account_manager'].first_name} {validated_data['account_manager'].last_name}".strip() if validated_data['account_manager'] else "None"
            
            PipelineActivity.objects.create(
                pipeline=instance,
                user=user,
                activity_type='manager_change',
                old_value=old_manager,
                new_value=new_manager,
            )
        
        # Pass the user to save method for stage change tracking
        pipeline = super().update(instance, validated_data)
        return pipeline