from django.db import models
from django.contrib.auth.models import User


class CollaborationRequest(models.Model):

    STATUS_CHOICES = [

        ("pending", "Pending"),

        ("accepted", "Accepted"),

        ("rejected", "Rejected"),

    ]


    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sent_requests"
    )


    receiver = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="received_requests"
    )


    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )


    created_at = models.DateTimeField(
        auto_now_add=True
    )


    def __str__(self):

        return f"{self.sender.username} → {self.receiver.username}"

