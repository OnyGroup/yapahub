import json
from channels.generic.websocket import AsyncWebsocketConsumer

class CallStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        self.room_group_name = f'call_status_{self.session_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'call_status_message',
                'message': message
            }
        )

    async def call_status_message(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))

class IncomingCallConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # uses 'global' as the default group name if no session_id is provided
        self.session_id = self.scope['url_route']['kwargs'].get('session_id', 'global')
        self.group_name = f'incoming_call_{self.session_id}'

        # Join group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def call_status_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event))
