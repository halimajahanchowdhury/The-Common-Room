from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from pgvector.django import VectorField

class SkillVectorField(VectorField):
    """
    PostgreSQL pgvector field that uses native 'vector(384)' when the pgvector
    extension is active (e.g. Neon PostgreSQL on Render), and gracefully falls
    back to 'jsonb' if running on a local development environment without the C-extension.
    """
    def db_type(self, connection):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1 FROM pg_extension WHERE extname = 'vector'")
                if cursor.fetchone():
                    return super().db_type(connection)
        except Exception:
            pass
        return 'jsonb'

    def from_db_value(self, value, expression, connection):
        if value is None:
            return None
        if isinstance(value, list):
            return value
        return super().from_db_value(value, expression, connection)

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

    # Semantic Vector Embeddings (pgvector 384 dimensions)
    teach_embedding = SkillVectorField(dimensions=384, null=True, blank=True)
    learn_embedding = SkillVectorField(dimensions=384, null=True, blank=True)

    def save(self, *args, **kwargs):
        # Auto-generate or update semantic embeddings whenever skills are modified
        try:
            from .embeddings import generate_embedding
            if self.skills_can_teach and self.skills_can_teach.strip():
                self.teach_embedding = generate_embedding(self.skills_can_teach)
            else:
                self.teach_embedding = None

            if self.skills_want_to_learn and self.skills_want_to_learn.strip():
                self.learn_embedding = generate_embedding(self.skills_want_to_learn)
            else:
                self.learn_embedding = None
        except Exception:
            pass

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username}'s Profile"
