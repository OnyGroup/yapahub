from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Message, Ticket

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.HiddenField(default=serializers.CurrentUserDefault())  # Automatically set the sender
    recipient = serializers.CharField(write_only=True)  # Accepts username or email during creation
    sender_username = serializers.CharField(source="sender.username", read_only=True)  # For frontend display
    recipient_username = serializers.CharField(source="recipient.username", read_only=True)  # For frontend display

    class Meta:
        model = Message
        fields = ['id', 'sender', 'recipient', 'sender_username', 'recipient_username', 'subject', 'body', 'timestamp', 'is_read']

    def validate_recipient(self, value):
        """Ensure the recipient exists and prevent self-messaging."""
        request_user = self.context['request'].user  # Get the currently authenticated user

        if value == request_user.username:
            raise serializers.ValidationError("You cannot send a message to yourself.")

        try:
            user = User.objects.get(username=value)  # Convert the username to a User object
        except User.DoesNotExist:
            raise serializers.ValidationError("Recipient user does not exist.")

        return user

    def create(self, validated_data):
        """Create a new message with the validated recipient."""
        return Message.objects.create(**validated_data) 

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['id', 'customer', 'agent', 'subject', 'description', 'status', 'created_at', 'updated_at']
