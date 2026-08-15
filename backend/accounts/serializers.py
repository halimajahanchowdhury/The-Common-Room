from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username_or_email = attrs.get("username", "").strip()

        # Support sign-in with either username or email address (case-insensitive)
        if "@" in username_or_email:
            try:
                user_obj = User.objects.get(email__iexact=username_or_email)
                attrs["username"] = user_obj.username
            except User.DoesNotExist:
                pass
        else:
            try:
                user_obj = User.objects.get(username__iexact=username_or_email)
                attrs["username"] = user_obj.username
            except User.DoesNotExist:
                pass

        return super().validate(attrs)

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=1)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')

    def validate_username(self, value):
        cleaned = value.strip()
        if User.objects.filter(username__iexact=cleaned).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return cleaned

    def validate_email(self, value):
        cleaned = value.strip().lower()
        if cleaned and User.objects.filter(email__iexact=cleaned).exists():
            raise serializers.ValidationError("A user with that email address already exists.")
        return cleaned

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')
