from rest_framework import serializers

from .models import CollaborationRequest


class CollaborationRequestSerializer(serializers.ModelSerializer):

    sender_username = serializers.CharField(
        source="sender.username",
        read_only=True
    )

    receiver_username = serializers.CharField(
        source="receiver.username",
        read_only=True
    )


    class Meta:

        model = CollaborationRequest

        fields = [
            "id",
            "sender",
            "sender_username",
            "receiver",
            "receiver_username",
            "status",
            "created_at",
        ]

        read_only_fields = [
            "sender",
            "created_at",
        ]

