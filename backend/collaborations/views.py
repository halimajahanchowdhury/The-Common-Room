from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth.models import User

from .models import CollaborationRequest
from .serializers import CollaborationRequestSerializer



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

