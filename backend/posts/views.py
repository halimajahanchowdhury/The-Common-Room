from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from profiles.models import Profile
from collaborations.models import CollaborationRequest

from .models import Comment
from .serializers import CommentSerializer


# Create a comment
class CreateCommentView(generics.CreateAPIView):

    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):

        profile_id = self.request.data.get("profile")

        profile = Profile.objects.get(id=profile_id)

        is_collaborator = CollaborationRequest.objects.filter(
            sender=self.request.user,
            receiver=profile.user,
            status="accepted"
        ).exists() or CollaborationRequest.objects.filter(
            sender=profile.user,
            receiver=self.request.user,
            status="accepted"
        ).exists()

        if not is_collaborator:
            raise PermissionDenied(
                "You must be accepted collaborators before commenting."
            )

        serializer.save(
            author=self.request.user,
            profile=profile
        )


# View all comments for a profile
class ProfileCommentsView(generics.ListAPIView):

    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        profile_id = self.kwargs["profile_id"]

        return Comment.objects.filter(
            profile_id=profile_id
        ).order_by("created_at")


