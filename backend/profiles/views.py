from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Profile
from .serializers import ProfileSerializer
from .embeddings import generate_embedding, compute_cosine_similarity

class MyProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)

        # Offload avatars from Base64 DB text to Cloud Object Storage (Cloudinary/Local)
        if 'profile_picture' in data:
            raw_pic = data.get('profile_picture')
            if raw_pic:
                from .storage import upload_avatar
                cleaned_url = upload_avatar(raw_pic, request.user.username, request)
                data['profile_picture'] = cleaned_url
            else:
                data['profile_picture'] = None
        elif 'profile_picture' in request.FILES:
            from .storage import upload_avatar
            cleaned_url = upload_avatar(request.FILES['profile_picture'], request.user.username, request)
            data['profile_picture'] = cleaned_url

        serializer = ProfileSerializer(profile, data=data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProfileListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            # Ensure requesting user has an initialized profile record
            my_profile, _ = Profile.objects.get_or_create(
                user=request.user,
                defaults={'full_name': request.user.username}
            )

            # Exclude active logged-in user
            profiles_qs = Profile.objects.exclude(user=request.user).select_related('user')

            search_query = request.query_params.get('search', '').strip()
            skill_query = request.query_params.get('skill', '').strip()

            if search_query:
                profiles_qs = profiles_qs.filter(
                    Q(full_name__icontains=search_query) |
                    Q(user__username__icontains=search_query) |
                    Q(university__icontains=search_query) |
                    Q(department__icontains=search_query) |
                    Q(bio__icontains=search_query) |
                    Q(skills_can_teach__icontains=search_query) |
                    Q(skills_want_to_learn__icontains=search_query)
                )

            if skill_query:
                profiles_qs = profiles_qs.filter(
                    Q(skills_can_teach__icontains=skill_query) |
                    Q(skills_want_to_learn__icontains=skill_query)
                )

            profiles_list = list(profiles_qs)

            # Rank candidate matches by cosine similarity
            try:
                from .embeddings import is_empty_vector
                my_learn_vec = getattr(my_profile, 'learn_embedding', None)
                if is_empty_vector(my_learn_vec) and getattr(my_profile, 'skills_want_to_learn', None):
                    my_learn_vec = generate_embedding(my_profile.skills_want_to_learn)

                if not is_empty_vector(my_learn_vec):
                    # Precompute scores once in a single map so sorting is instant (0ms)
                    sim_map = {}
                    for p in profiles_list:
                        t_vec = getattr(p, 'teach_embedding', None)
                        if is_empty_vector(t_vec) and getattr(p, 'skills_can_teach', None):
                            t_vec = generate_embedding(p.skills_can_teach)
                        sim_map[p.id] = compute_cosine_similarity(my_learn_vec, t_vec)

                    profiles_list.sort(key=lambda p: (round(sim_map.get(p.id, 0.0), 4), p.id), reverse=True)
                else:
                    # Default to newest members first
                    profiles_list.sort(key=lambda p: p.id, reverse=True)
            except Exception:
                profiles_list.sort(key=lambda p: p.id, reverse=True)

            serializer = ProfileSerializer(profiles_list, many=True, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            # Bulletproof fallback: guaranteed HTTP 200 list of student profiles
            from .serializers import parse_skills
            fallback_qs = Profile.objects.exclude(user=request.user).select_related('user').order_by('-id')
            fallback_data = []
            for p in fallback_qs:
                username = getattr(p.user, 'username', '') if p.user else ''
                fallback_data.append({
                    'id': p.id,
                    'user_id': p.user_id,
                    'username': username,
                    'email': getattr(p.user, 'email', '') if p.user else '',
                    'full_name': p.full_name or username or 'Student',
                    'university': p.university or '',
                    'department': p.department or '',
                    'semester': p.semester or '',
                    'bio': p.bio or '',
                    'skills_can_teach': p.skills_can_teach or '',
                    'skills_want_to_learn': p.skills_want_to_learn or '',
                    'skills_can_teach_list': parse_skills(p.skills_can_teach),
                    'skills_want_to_learn_list': parse_skills(p.skills_want_to_learn),
                    'skill_matches': {
                        'has_match': False,
                        'can_learn_from_peer': [],
                        'can_teach_to_peer': [],
                        'matching_skills': [],
                        'semantic_score': 0.0,
                        'match_percentage': 0,
                        'is_semantic_match': False,
                    },
                    'profile_picture': p.profile_picture,
                })
            return Response(fallback_data, status=status.HTTP_200_OK)

class ProfileDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            profile = Profile.objects.get(id=pk)
        except Profile.DoesNotExist:
            try:
                profile = Profile.objects.get(user__id=pk)
            except Profile.DoesNotExist:
                return Response({'detail': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProfileSerializer(profile, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
