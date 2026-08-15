from rest_framework import serializers
from .models import CollaborationRequest

class CollaborationRequestSerializer(serializers.ModelSerializer):
    from_username = serializers.CharField(source='sender.username', read_only=True)
    to_username = serializers.CharField(source='receiver.username', read_only=True)
    from_user = serializers.CharField(source='sender.username', read_only=True)
    to_user = serializers.CharField(source='receiver.username', read_only=True)
    sender_full_name = serializers.SerializerMethodField()
    receiver_full_name = serializers.SerializerMethodField()
    date = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = CollaborationRequest
        fields = (
            'id',
            'sender',
            'receiver',
            'from_username',
            'to_username',
            'from_user',
            'to_user',
            'sender_full_name',
            'receiver_full_name',
            'skills',
            'status',
            'created_at',
            'updated_at',
            'date',
        )
        read_only_fields = ('id', 'sender', 'created_at', 'updated_at')

    def get_sender_full_name(self, obj):
        if hasattr(obj.sender, 'profile') and obj.sender.profile.full_name:
            return obj.sender.profile.full_name
        return obj.sender.username

    def get_receiver_full_name(self, obj):
        if hasattr(obj.receiver, 'profile') and obj.receiver.profile.full_name:
            return obj.receiver.profile.full_name
        return obj.receiver.username
