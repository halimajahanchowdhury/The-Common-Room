from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from django.contrib.auth.models import User

from .models import CollaborationRequest
from .serializers import CollaborationRequestSerializer



# Send a collaboration request
class CreateCollaborationRequestView(generics.CreateAPIView):

    serializer_class = CollaborationRequestSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):

        receiver_id = self.request.data.get("receiver")

        receiver = User.objects.get(id=receiver_id)

        serializer.save(
            sender=self.request.user,
            receiver=receiver
        )



# View collaboration requests received by the logged-in user
class ReceivedCollaborationRequestsView(generics.ListAPIView):

    serializer_class = CollaborationRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return CollaborationRequest.objects.filter(
            receiver=self.request.user
        ).order_by("-created_at")



# View collaboration requests sent by the logged-in user
class SentCollaborationRequestsView(generics.ListAPIView):

    serializer_class = CollaborationRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return CollaborationRequest.objects.filter(
            sender=self.request.user
        ).order_by("-created_at")




# Accept or Reject a collaboration request
class UpdateCollaborationRequestView(generics.UpdateAPIView):

    serializer_class = CollaborationRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return CollaborationRequest.objects.filter(
            receiver=self.request.user
        )

    def perform_update(self, serializer):

        status = self.request.data.get("status")

        serializer.save(status=status)



# Get collaboration status with another user
class CollaborationStatusView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):

        # Viewing your own profile
        if request.user.id == user_id:

            return Response({
                "status": "self"
            })

        request_obj = CollaborationRequest.objects.filter(
            sender=request.user,
            receiver_id=user_id
        ).first()

        if not request_obj:

            request_obj = CollaborationRequest.objects.filter(
                sender_id=user_id,
                receiver=request.user
            ).first()

        if not request_obj:

            return Response({
                "status": "none"
            })

        return Response({
            "status": request_obj.status
        })

