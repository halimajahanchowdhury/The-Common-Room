from django.db import models
from django.contrib.auth.models import User

STATUS_CHOICES = (
    ('delivered', 'Delivered'),
    ('seen', 'Seen'),
)

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_chat_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_chat_messages')
    text = models.TextField(blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='delivered')
    timestamp = models.DateTimeField(auto_now_add=True)

    # Multimedia and File Attachment fields
    attachment_url = models.CharField(max_length=1000, blank=True, null=True, default=None)
    attachment_name = models.CharField(max_length=255, blank=True, default="")
    attachment_type = models.CharField(max_length=50, blank=True, default="")  # e.g., 'image', 'document', 'audio', 'video'
    attachment_size = models.IntegerField(blank=True, null=True, default=None)  # File size in bytes

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        att_info = f" [Attachment: {self.attachment_name}]" if self.attachment_url else ""
        return f"Message from {self.sender.username} to {self.recipient.username}{att_info} ({self.status})"
