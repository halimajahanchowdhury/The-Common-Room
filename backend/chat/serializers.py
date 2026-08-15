from rest_framework import serializers
from .models import Message

class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    recipient_username = serializers.CharField(source='recipient.username', read_only=True)
    sender = serializers.CharField(source='sender.username', read_only=True)
    recipient = serializers.CharField(source='recipient.username', read_only=True)
    sender_full_name = serializers.SerializerMethodField()
    recipient_full_name = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = (
            'id',
            'sender',
            'recipient',
            'sender_username',
            'recipient_username',
            'sender_full_name',
            'recipient_full_name',
            'text',
            'status',
            'timestamp',
            'time',
        )
        read_only_fields = ('id', 'sender', 'timestamp')

    def get_sender_full_name(self, obj):
        if hasattr(obj.sender, 'profile') and obj.sender.profile.full_name:
            return obj.sender.profile.full_name
        return obj.sender.username

    def get_recipient_full_name(self, obj):
        if hasattr(obj.recipient, 'profile') and obj.recipient.profile.full_name:
            return obj.recipient.profile.full_name
        return obj.recipient.username

    def get_time(self, obj):
        if obj.timestamp:
            return obj.timestamp.strftime("%I:%M %p")
        return ""
