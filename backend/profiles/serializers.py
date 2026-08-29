import re
from rest_framework import serializers
from .models import Profile

def parse_skills(skills_str):
    if not skills_str:
        return []
    skills = []
    for item in re.split(r'[,;\n\r|•]+', str(skills_str)):
        cleaned = item.strip()
        if cleaned and cleaned not in skills:
            skills.append(cleaned)
    return skills

class ProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    skills_can_teach_list = serializers.SerializerMethodField()
    skills_want_to_learn_list = serializers.SerializerMethodField()
    skill_matches = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = (
            'id',
            'user_id',
            'username',
            'email',
            'full_name',
            'university',
            'department',
            'semester',
            'bio',
            'skills_can_teach',
            'skills_want_to_learn',
            'skills_can_teach_list',
            'skills_want_to_learn_list',
            'skill_matches',
            'profile_picture',
        )

    def get_skills_can_teach_list(self, obj):
        return parse_skills(obj.skills_can_teach)

    def get_skills_want_to_learn_list(self, obj):
        return parse_skills(obj.skills_want_to_learn)

    def get_skill_matches(self, obj):
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return {
                'has_match': False,
                'can_learn_from_peer': [],
                'can_teach_to_peer': [],
                'matching_skills': [],
            }

        # If comparing with self
        if request.user.id == obj.user.id:
            return {
                'has_match': False,
                'can_learn_from_peer': [],
                'can_teach_to_peer': [],
                'matching_skills': [],
            }

        try:
            my_profile = request.user.profile
        except AttributeError:
            return {
                'has_match': False,
                'can_learn_from_peer': [],
                'can_teach_to_peer': [],
                'matching_skills': [],
            }

        my_teach = parse_skills(my_profile.skills_can_teach)
        my_learn = parse_skills(my_profile.skills_want_to_learn)
        target_teach = parse_skills(obj.skills_can_teach)
        target_learn = parse_skills(obj.skills_want_to_learn)

        my_learn_lower_map = {s.lower(): s for s in my_learn}
        my_teach_lower_map = {s.lower(): s for s in my_teach}

        can_learn_from_peer = []
        for s in target_teach:
            if s.lower() in my_learn_lower_map and s not in can_learn_from_peer:
                can_learn_from_peer.append(s)

        can_teach_to_peer = []
        for s in target_learn:
            if s.lower() in my_teach_lower_map and s not in can_teach_to_peer:
                can_teach_to_peer.append(s)

        all_matches = list(dict.fromkeys(can_learn_from_peer + can_teach_to_peer))

        return {
            'has_match': len(all_matches) > 0,
            'can_learn_from_peer': can_learn_from_peer,
            'can_teach_to_peer': can_teach_to_peer,
            'matching_skills': all_matches,
        }
