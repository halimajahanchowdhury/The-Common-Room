from django.db import models
from django.contrib.auth.models import User

STATUS_CHOICES = (
    ('delivered', 'Delivered'),
    ('seen', 'Seen'),
)

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_chat_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_chat_messages')
    text = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='delivered')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"Message from {self.sender.username} to {self.recipient.username} ({self.status})"
