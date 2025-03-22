from rest_framework import serializers
from .models import CallLog, CallbackURL, PhoneNumber
from django.contrib.auth.models import User

class UserMinimalSerializer(serializers.ModelSerializer):
    """Minimal user info for embedding in other serializers"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class PhoneNumberSerializer(serializers.ModelSerializer):
    assigned_to = UserMinimalSerializer(read_only=True)
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='assigned_to',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = PhoneNumber
        fields = ['id', 'number', 'is_active', 'assigned_to', 'assigned_to_id', 'description', 'created_at']

class CallLogSerializer(serializers.ModelSerializer):
    caller = UserMinimalSerializer(read_only=True)
    receiver = UserMinimalSerializer(read_only=True)
    caller_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='caller',
        write_only=True
    )
    receiver_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='receiver',
        write_only=True,
        required=False,
        allow_null=True
    )
    duration_formatted = serializers.SerializerMethodField()

    class Meta:
        model = CallLog
        fields = [
            'id', 'session_id', 'caller', 'caller_id', 'receiver', 'receiver_id',
            'phone_number', 'direction', 'start_time', 'end_time',
            'duration', 'duration_formatted', 'status', 'notes'
        ]

    def get_duration_formatted(self, obj):
        if obj.duration:
            minutes, seconds = divmod(obj.duration, 60)
            hours, minutes = divmod(minutes, 60)
            return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
        return None

class CallbackURLSerializer(serializers.ModelSerializer):
    class Meta:
        model = CallbackURL
        fields = ['id', 'name', 'url', 'is_active', 'created_at']

class MakeCallSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=20)

class CallStatusSerializer(serializers.Serializer):
    """Serializer for receiving call status callbacks"""
    sessionId = serializers.CharField()
    status = serializers.CharField()
    phoneNumber = serializers.CharField()
    duration = serializers.IntegerField(required=False)
