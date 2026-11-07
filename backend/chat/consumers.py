import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import Message

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')

        # Only allow authenticated users
        if not self.user or not self.user.is_authenticated:
            await self.close(code=4001)
            return

        self.peer_id = self.scope['url_route']['kwargs'].get('peer_id')
        try:
            self.peer_id = int(self.peer_id)
        except (ValueError, TypeError):
            await self.close(code=4002)
            return

        # Room name combines the two user IDs in sorted order so both peers share the same room
        # e.g. room_chat_2_5
        user_ids = sorted([self.user.id, self.peer_id])
        self.room_group_name = f"chat_{user_ids[0]}_{user_ids[1]}"

        # Join the room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Mark all pending messages from this peer as 'seen'
        await self.mark_messages_seen(self.peer_id, self.user.id)

        # Notify the room that messages were seen
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'messages_seen_event',
                'seen_by': self.user.id,
                'peer_id': self.peer_id,
            }
        )

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action', 'send_message')

        if action == 'send_message':
            text = data.get('text', '').strip()
            attachment_url = data.get('attachment_url')
            attachment_name = data.get('attachment_name', '')
            attachment_type = data.get('attachment_type', '')
            attachment_size = data.get('attachment_size')

            if not text and not attachment_url:
                return

            # Save to database
            message_obj = await self.save_message(
                self.user.id,
                self.peer_id,
                text,
                attachment_url,
                attachment_name,
                attachment_type,
                attachment_size,
            )

            if message_obj:
                # Broadcast the new message to everyone in this room
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message_event',
                        'message': {
                            'id': message_obj['id'],
                            'sender_id': message_obj['sender_id'],
                            'sender_username': message_obj['sender_username'],
                            'recipient_id': message_obj['recipient_id'],
                            'text': message_obj['text'],
                            'status': message_obj['status'],
                            'timestamp': message_obj['timestamp'],
                            'attachment_url': message_obj['attachment_url'],
                            'attachment_name': message_obj['attachment_name'],
                            'attachment_type': message_obj['attachment_type'],
                            'attachment_size': message_obj['attachment_size'],
                        }
                    }
                )

        elif action == 'mark_seen':
            await self.mark_messages_seen(self.peer_id, self.user.id)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'messages_seen_event',
                    'seen_by': self.user.id,
                    'peer_id': self.peer_id,
                }
            )

    async def chat_message_event(self, event):
        # Send new message over WebSocket to client
        await self.send(text_data=json.dumps({
            'type': 'new_message',
            'message': event['message']
        }))

    async def messages_seen_event(self, event):
        # Notify client that messages were read
        await self.send(text_data=json.dumps({
            'type': 'messages_seen',
            'seen_by': event['seen_by'],
            'peer_id': event['peer_id']
        }))

    @database_sync_to_async
    def save_message(self, sender_id, recipient_id, text, attachment_url=None, attachment_name="", attachment_type="", attachment_size=None):
        try:
            recipient = User.objects.get(id=recipient_id)
            sender = User.objects.get(id=sender_id)
            msg = Message.objects.create(
                sender=sender,
                recipient=recipient,
                text=text,
                status='delivered',
                attachment_url=attachment_url,
                attachment_name=attachment_name,
                attachment_type=attachment_type,
                attachment_size=attachment_size,
            )
            return {
                'id': msg.id,
                'sender_id': msg.sender_id,
                'sender_username': msg.sender.username,
                'recipient_id': msg.recipient_id,
                'text': msg.text,
                'status': msg.status,
                'timestamp': msg.timestamp.isoformat(),
                'attachment_url': msg.attachment_url,
                'attachment_name': msg.attachment_name,
                'attachment_type': msg.attachment_type,
                'attachment_size': msg.attachment_size,
            }
        except User.DoesNotExist:
            return None

    @database_sync_to_async
    def mark_messages_seen(self, sender_id, recipient_id):
        Message.objects.filter(
            sender_id=sender_id,
            recipient_id=recipient_id,
            status='delivered'
        ).update(status='seen')

