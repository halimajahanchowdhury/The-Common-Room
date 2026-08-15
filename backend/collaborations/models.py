from django.db import models
from django.contrib.auth.models import User

STATUS_CHOICES = (
    ('pending', 'Pending'),
    ('accepted', 'Accepted'),
    ('rejected', 'Rejected'),
    ('declined', 'Declined'),
)

class CollaborationRequest(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_collaborations')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_collaborations')
    skills = models.CharField(max_length=255, blank=True, default="")
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Collaboration from {self.sender.username} to {self.receiver.username} ({self.status})"
