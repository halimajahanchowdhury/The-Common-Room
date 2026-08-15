from rest_framework import serializers
from .models import Post, Comment

class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    author_full_name = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = (
            'id',
            'post',
            'profile',
            'author',
            'author_username',
            'author_full_name',
            'content',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'author', 'created_at', 'updated_at')

    def get_author_full_name(self, obj):
        if hasattr(obj.author, 'profile') and obj.author.profile.full_name:
            return obj.author.profile.full_name
        return obj.author.username

class PostSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    author_full_name = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = (
            'id',
            'author',
            'author_username',
            'author_full_name',
            'content',
            'comments',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'author', 'created_at', 'updated_at')

    def get_author_full_name(self, obj):
        if hasattr(obj.author, 'profile') and obj.author.profile.full_name:
            return obj.author.profile.full_name
        return obj.author.username
