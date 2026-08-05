from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    full_name = models.CharField(max_length=100)
    university = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    semester = models.CharField(max_length=50)

    bio = models.TextField(blank=True)

    profile_picture = models.ImageField(
        upload_to="profile_pictures/",
        blank=True,
        null=True
    )

    skills_can_teach = models.TextField(
        blank=True,
        help_text="Separate skills with commas."
    )

    skills_want_to_learn = models.TextField(
        blank=True,
        help_text="Separate skills with commas."
    )

    def __str__(self):
        return self.user.username