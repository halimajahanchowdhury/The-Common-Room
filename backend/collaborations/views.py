from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db.models import Q
from profiles.models import Profile
from .models import CollaborationRequest
from .serializers import CollaborationRequestSerializer

class CreateCollaborationRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        receiver_id = request.data.get('receiver')
        skills = request.data.get('skills', '')

        if not receiver_id:
            return Response({'error': 'receiver field is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            receiver_id = int(receiver_id)
        except (ValueError, TypeError):
            return Response({'error': 'Invalid receiver ID format.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            profile = Profile.objects.get(pk=receiver_id)
            receiver = profile.user
        except Profile.DoesNotExist:
            try:
                receiver = User.objects.get(pk=receiver_id)
            except User.DoesNotExist:
                return Response({'error': 'Receiver user not found.'}, status=status.HTTP_404_NOT_FOUND)

        if receiver.id == request.user.id:
            return Response({'error': 'You cannot send a collaboration request to yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check for existing request in EITHER direction (pending or accepted)
        existing_collab = CollaborationRequest.objects.filter(
            (Q(sender=request.user, receiver=receiver) | Q(sender=receiver, receiver=request.user)),
            status__in=['pending', 'accepted', 'Pending', 'Accepted']
        ).first()

        if existing_collab:
            status_lower = existing_collab.status.lower()
            if status_lower == 'accepted':
                return Response({'error': 'You are already connected as collaborators with this student.'}, status=status.HTTP_400_BAD_REQUEST)
            elif existing_collab.sender == request.user:
                return Response({'error': 'A collaboration request has already been sent to this student.'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'error': 'This student has already sent you a collaboration request. Please respond on your Dashboard.'}, status=status.HTTP_400_BAD_REQUEST)

        collab_request = CollaborationRequest.objects.create(
            sender=request.user,
            receiver=receiver,
            skills=skills,
            status='pending'
        )

        serializer = CollaborationRequestSerializer(collab_request)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class SentCollaborationRequestsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        requests = CollaborationRequest.objects.filter(sender=request.user)
        serializer = CollaborationRequestSerializer(requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ReceivedCollaborationRequestsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        requests = CollaborationRequest.objects.filter(receiver=request.user)
        serializer = CollaborationRequestSerializer(requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UpdateCollaborationRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        collab_request = get_object_or_404(CollaborationRequest, pk=pk)

        # Only the receiver can update status (accept/decline)
        if collab_request.receiver != request.user:
            return Response({'error': 'You do not have permission to modify this request.'}, status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get('status')
        if new_status not in ['accepted', 'declined', 'rejected', 'Accepted', 'Declined', 'Rejected']:
            return Response({'error': 'Invalid status choice.'}, status=status.HTTP_400_BAD_REQUEST)

        normalized_status = new_status.lower()
        collab_request.status = normalized_status
        collab_request.save()

        serializer = CollaborationRequestSerializer(collab_request)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CollaborationStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        try:
            target_id = int(user_id)
        except (ValueError, TypeError):
            return Response({'error': 'Invalid user ID.'}, status=status.HTTP_400_BAD_REQUEST)

        # Resolve target User object from either Profile ID or User ID
        target_user = None
        try:
            profile = Profile.objects.get(pk=target_id)
            target_user = profile.user
        except Profile.DoesNotExist:
            try:
                target_user = User.objects.get(pk=target_id)
            except User.DoesNotExist:
                return Response({'status': 'none'}, status=status.HTTP_200_OK)

        if target_user.id == request.user.id:
            return Response({'status': 'self'}, status=status.HTTP_200_OK)

        collab = CollaborationRequest.objects.filter(
            (Q(sender=request.user, receiver=target_user) | Q(sender=target_user, receiver=request.user))
        ).order_by('-created_at').first()

        if not collab:
            return Response({'status': 'none'}, status=status.HTTP_200_OK)

        return Response({
            'status': collab.status,
            'request_id': collab.id,
            'is_sender': collab.sender == request.user
        }, status=status.HTTP_200_OK)
