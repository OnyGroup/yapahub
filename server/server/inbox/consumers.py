# inbox/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Message
from channels.db import database_sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope["user"].is_anonymous:
            await self.close(code=4003)  # Close with a custom code for clarity
            return
        
        # Get the room_name from the URL route
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f"chat_{self.room_name}"
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        
        # Send connection success message
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': f'Connected to room: {self.room_name}',
            'user': self.scope["user"].username
        }))

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message = data.get("message", "")
            
            # Handle authentication message
            if data.get("type") == "authenticate":
                # Authentication logic would go here
                return
                
            recipient = data.get("recipient", "")
            subject = data.get("subject", "")
            
            user = self.scope["user"]
            sender = user.username
            
            # Create the message in the database
            # This is pseudo-code - adjust based on your actual models
            message_obj = await database_sync_to_async(Message.objects.create)(
                sender=user,
                recipient_username=recipient,
                subject=subject,
                body=message
            )
            
            # Convert to dict for serialization
            message_data = {
                "type": "chat_message",
                "id": message_obj.id,
                "message": message,
                "sender": sender,
                "recipient": recipient,
                "subject": subject,
                "timestamp": message_obj.timestamp.isoformat()
            }
            
            # Send to sender's group
            await self.channel_layer.group_send(
                f"chat_{sender}",
                message_data
            )
            
            # Send to recipient's group
            await self.channel_layer.group_send(
                f"chat_{recipient}",
                message_data
            )
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                "error": "Invalid JSON format"
            }))

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            "message": event["message"],
            "sender": event["sender"],
        }))