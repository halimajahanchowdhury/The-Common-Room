from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Profile
from .serializers import ProfileSerializer

class MyProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProfileListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Exclude active logged-in user
        profiles = Profile.objects.exclude(user=request.user)

        search_query = request.query_params.get('search', '').strip()
        skill_query = request.query_params.get('skill', '').strip()

        if search_query:
            profiles = profiles.filter(
                Q(full_name__icontains=search_query) |
                Q(user__username__icontains=search_query) |
                Q(university__icontains=search_query) |
                Q(department__icontains=search_query) |
                Q(bio__icontains=search_query) |
                Q(skills_can_teach__icontains=search_query) |
                Q(skills_want_to_learn__icontains=search_query)
            )

        if skill_query:
            profiles = profiles.filter(
                Q(skills_can_teach__icontains=skill_query) |
                Q(skills_want_to_learn__icontains=skill_query)
            )

        serializer = ProfileSerializer(profiles, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

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
