from django.db import models
from django.contrib.auth.models import User

from profiles.models import Profile


class Comment(models.Model):

    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="comments"
    )

    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="comments"
    )

    content = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return f"{self.author.username} → {self.profile.full_name}"


