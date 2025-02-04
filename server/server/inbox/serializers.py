from rest_framework import serializers
from .models import Message, Ticket, User

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.CharField(source="sender.username")  # Serialize sender as username
    recipient = serializers.CharField(source="recipient.username")  # Serialize recipient as username

    class Meta:
        model = Message
        fields = ['id', 'sender', 'recipient', 'subject', 'body', 'timestamp', 'is_read']

    def validate_recipient(self, value):
        # Ensure recipient exists and return the User object
        try:
            user = User.objects.get(username=value) 
        except User.DoesNotExist:
            raise serializers.ValidationError("Recipient user does not exist.")
        return user

    def create(self, validated_data):
        recipient_username = validated_data.pop("recipient")  # Get the username
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
