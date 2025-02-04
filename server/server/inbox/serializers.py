from rest_framework import serializers
from .models import Message, Ticket, User

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.HiddenField(default=serializers.CurrentUserDefault())  # Automatically assign sender from the JWT token
    recipient = serializers.CharField()  # Accepts username or email

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
