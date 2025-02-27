import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from inbox.models import Message  # Import your message model

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get the room_name from the URL route
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        
        # For debugging - log the connection attempt
        print(f"WebSocket connection attempt: user={self.scope['user']}, room={self.room_name}")
        
        # Check if user is authenticated, but with more verbose logging
        if self.scope["user"].is_anonymous:
            print(f"WebSocket connection rejected: anonymous user for room {self.room_name}")
            await self.close(code=4003)  # Close with a custom code
            return
        
        # Accept connection regardless of room name
        # This allows connections to user-specific rooms
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
        print(f"WebSocket connection accepted: user={self.scope['user'].username}, room={self.room_name}")

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        print(f"WebSocket disconnected: user={getattr(self.scope['user'], 'username', 'anonymous')}, room={self.room_name}, code={close_code}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            
            # Check if this is an authentication message
            if data.get("type") == "authenticate":
                print(f"Received authentication message from {self.scope['user'].username}")
                return
                
            message = data.get("message", "")
            recipient = data.get("recipient", "")
            subject = data.get("subject", "New Message")
            
            sender = self.scope["user"].username
            
            print(f"Received message: from={sender}, to={recipient}, subject={subject}")
            
            # Save message to database
            message_id = await self.save_message(sender, recipient, subject, message)
            
            # Send message to room group - both for sender and recipient
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": message,
                    "sender": sender,
                    "recipient": recipient,
                    "subject": subject,
                    "message_id": message_id
                }
            )
            
            # Also send to recipient's group if different
            recipient_group = f"chat_{recipient}"
            if recipient_group != self.room_group_name:
                try:
                    await self.channel_layer.group_send(
                        recipient_group,
                        {
                            "type": "chat_message",
                            "message": message,
                            "sender": sender,
                            "recipient": recipient,
                            "subject": subject,
                            "message_id": message_id
                        }
                    )
                    print(f"Message forwarded to recipient group: {recipient_group}")
                except Exception as e:
                    print(f"Error sending to recipient group: {e}")
            
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                "error": "Invalid JSON format"
            }))
        except Exception as e:
            print(f"Error in receive: {e}")
            await self.send(text_data=json.dumps({
                "error": f"Server error: {str(e)}"
            }))

    @database_sync_to_async
    def save_message(self, sender_username, recipient_username, subject, body):
        try:
            sender = User.objects.get(username=sender_username)
            recipient = User.objects.get(username=recipient_username)
            
            message = Message.objects.create(
                sender=sender, 
                recipient=recipient, 
                subject=subject,
                body=body
            )
            
            return message.id 
        except User.DoesNotExist:
            print(f"Error: One or both users not found - sender: {sender_username}, recipient: {recipient_username}")
            return None

    async def chat_message(self, event):
        # Send message to WebSocket
        try:
            await self.send(text_data=json.dumps({
                "message": event["message"],
                "sender": event["sender"],
                "recipient": event.get("recipient", ""),
                "subject": event.get("subject", ""),
                "message_id": event.get("message_id", None)
            }))
        except Exception as e:
            print(f"Error in chat_message: {e}")