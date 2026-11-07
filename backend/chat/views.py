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
        attachment_url = request.data.get('attachment_url')
        attachment_name = request.data.get('attachment_name', '')
        attachment_type = request.data.get('attachment_type', '')
        attachment_size = request.data.get('attachment_size')

        # Handle direct file upload in message POST if present
        if 'file' in request.FILES:
            from .storage import upload_chat_attachment
            try:
                att_data = upload_chat_attachment(request.FILES['file'], request.user.username, request)
                attachment_url = att_data['attachment_url']
                attachment_name = att_data['attachment_name']
                attachment_type = att_data['attachment_type']
                attachment_size = att_data['attachment_size']
            except ValueError as val_err:
                return Response({'error': str(val_err)}, status=status.HTTP_400_BAD_REQUEST)

        if not text and not attachment_url:
            return Response({'error': 'Message text or attachment is required.'}, status=status.HTTP_400_BAD_REQUEST)

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
            status='delivered',
            attachment_url=attachment_url,
            attachment_name=attachment_name,
            attachment_type=attachment_type,
            attachment_size=attachment_size,
        )

        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ChatAttachmentUploadView(APIView):
    """
    Dedicated DRF endpoint for chat attachments with file size (max 10MB)
    and file type security validation, backed by Cloud Object Storage.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file was provided in the upload request.'}, status=status.HTTP_400_BAD_REQUEST)

        from .storage import upload_chat_attachment
        try:
            result = upload_chat_attachment(file_obj, request.user.username, request)
            return Response(result, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': 'Failed to process attachment.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
