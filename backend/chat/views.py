from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db.models import Q
from collaborations.models import CollaborationRequest
from profiles.models import Profile
from profiles.serializers import ProfileSerializer
from .models import Message
from .serializers import MessageSerializer

def get_user_by_identifier(identifier):
    if not identifier:
        return None
    try:
        user_id = int(identifier)
        return User.objects.filter(pk=user_id).first()
    except (ValueError, TypeError):
        user = User.objects.filter(username__iexact=identifier).first()
        if user:
            return user
        profile = Profile.objects.filter(full_name__iexact=identifier).first()
        if profile:
            return profile.user
    return None

class MessageListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        peer_param = request.query_params.get('peer', '').strip()
        if not peer_param:
            # If no peer query param, return all messages involving request.user
            messages = Message.objects.filter(Q(sender=request.user) | Q(recipient=request.user))
            serializer = MessageSerializer(messages, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        peer_user = get_user_by_identifier(peer_param)
        if not peer_user:
            return Response({'error': 'Peer student not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Automatically mark incoming messages from peer as SEEN when chat is opened
        Message.objects.filter(sender=peer_user, recipient=request.user, status='delivered').update(status='seen')

        messages = Message.objects.filter(
            (Q(sender=request.user, recipient=peer_user) | Q(sender=peer_user, recipient=request.user))
        ).order_by('timestamp')

        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        recipient_param = request.data.get('recipient')
        text = request.data.get('text', '').strip()

        if not text:
            return Response({'error': 'Message text cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

        if not recipient_param:
            return Response({'error': 'Recipient field is required.'}, status=status.HTTP_400_BAD_REQUEST)

        recipient_user = get_user_by_identifier(recipient_param)
        if not recipient_user:
            return Response({'error': 'Recipient student not found.'}, status=status.HTTP_404_NOT_FOUND)

        if recipient_user.id == request.user.id:
            return Response({'error': 'You cannot send a message to yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        message = Message.objects.create(
            sender=request.user,
            recipient=recipient_user,
            text=text,
            status='delivered'
        )

        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ConversationListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Fetch all accepted collaboration peer connections
        accepted_collabs = CollaborationRequest.objects.filter(
            (Q(sender=request.user) | Q(receiver=request.user)) & Q(status__iexact='accepted')
        )

        peer_users = set()
        for c in accepted_collabs:
            if c.sender == request.user:
                peer_users.add(c.receiver)
            else:
                peer_users.add(c.sender)

        # Include any peer users with existing chat history
        chat_peers = Message.objects.filter(Q(sender=request.user) | Q(recipient=request.user))
        for m in chat_peers:
            if m.sender != request.user:
                peer_users.add(m.sender)
            if m.recipient != request.user:
                peer_users.add(m.recipient)

        results = []
        for peer in peer_users:
            profile, _ = Profile.objects.get_or_create(user=peer)
            p_data = ProfileSerializer(profile).data
            
            unread_count = Message.objects.filter(sender=peer, recipient=request.user, status='delivered').count()
            last_msg = Message.objects.filter(
                (Q(sender=request.user, recipient=peer) | Q(sender=peer, recipient=request.user))
            ).order_by('-timestamp').first()

            p_data['unread_count'] = unread_count
            p_data['last_message'] = last_msg.text if last_msg else ""
            p_data['last_message_time'] = last_msg.timestamp.strftime("%I:%M %p") if last_msg else ""
            results.append(p_data)

        return Response(results, status=status.HTTP_200_OK)


class MarkMessagesReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        peer_param = request.data.get('peer')
        peer_user = get_user_by_identifier(peer_param)

        if not peer_user:
            return Response({'error': 'Peer not found.'}, status=status.HTTP_404_NOT_FOUND)

        updated_count = Message.objects.filter(
            sender=peer_user,
            recipient=request.user,
            status='delivered'
        ).update(status='seen')

        return Response({'message': f'{updated_count} messages marked as seen.'}, status=status.HTTP_200_OK)


class UnreadCountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Message.objects.filter(recipient=request.user, status='delivered').count()
        return Response({'unread_count': count}, status=status.HTTP_200_OK)
