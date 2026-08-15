from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    full_name = models.CharField(max_length=255, blank=True, default="")
    university = models.CharField(max_length=255, blank=True, default="")
    department = models.CharField(max_length=255, blank=True, default="")
    semester = models.CharField(max_length=100, blank=True, default="")
    bio = models.TextField(blank=True, default="")
    skills_can_teach = models.TextField(blank=True, default="")
    skills_want_to_learn = models.TextField(blank=True, default="")
    profile_picture = models.TextField(blank=True, null=True, default=None)

    def __str__(self):
        return f"{self.user.username}'s Profile"

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance, full_name=instance.username)
    else:
        if hasattr(instance, 'profile'):
            instance.profile.save()
