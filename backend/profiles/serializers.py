from rest_framework import serializers
from .models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            "id",
            "full_name",
            "university",
            "department",
            "semester",
            "bio",
            "skills_can_teach",
            "skills_want_to_learn",
        ]


