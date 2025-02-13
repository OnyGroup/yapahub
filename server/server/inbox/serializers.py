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
        """Ensure the recipient exists in the database."""
        try:
            user = User.objects.get(username=value)  # Look up recipient by username
        except User.DoesNotExist:
            raise serializers.ValidationError("Recipient user does not exist.")
        return user

    def create(self, validated_data):
        """Create a new message."""
        recipient_username = validated_data.pop("recipient")  # Get the recipient username
        try:
            recipient = User.objects.get(username=recipient_username)  # Convert to User object
        except User.DoesNotExist:
            raise serializers.ValidationError({"recipient": "Recipient user does not exist."})

        # Create the message with the recipient as a User object
        message = Message.objects.create(recipient=recipient, **validated_data)
        return message

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['id', 'customer', 'agent', 'subject', 'description', 'status', 'created_at', 'updated_at']
