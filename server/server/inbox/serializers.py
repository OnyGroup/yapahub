from rest_framework import serializers
from .models import Message, Ticket, User

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.CharField()  # Accepts username or email
    recipient = serializers.CharField()  # Accepts username or email

    class Meta:
        model = Message
        fields = ['id', 'sender', 'recipient', 'subject', 'body', 'timestamp', 'is_read']

    def validate_sender(self, value):
        # Ensure sender exists and return the User object
        try:
            user = User.objects.get(username=value)  # Or use email instead of username
        except User.DoesNotExist:
            raise serializers.ValidationError("Sender user does not exist.")
        return user

    def validate_recipient(self, value):
        # Ensure recipient exists and return the User object
        try:
            user = User.objects.get(username=value)  # Or use email instead of username
        except User.DoesNotExist:
            raise serializers.ValidationError("Recipient user does not exist.")
        return user

    def create(self, validated_data):
        # Extract sender and recipient User instances
        sender = validated_data.pop('sender')
        recipient = validated_data.pop('recipient')

        # Create the message with sender and recipient User instances
        message = Message.objects.create(sender=sender, recipient=recipient, **validated_data)
        return message

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['id', 'customer', 'agent', 'subject', 'description', 'status', 'created_at', 'updated_at']
