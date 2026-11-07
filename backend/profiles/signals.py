import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Profile

logger = logging.getLogger(__name__)

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.get_or_create(user=instance, defaults={'full_name': instance.username})
    else:
        if hasattr(instance, 'profile'):
            try:
                instance.profile.save()
            except Exception as e:
                logger.error(f"Error saving profile for user {instance.username}: {e}")

