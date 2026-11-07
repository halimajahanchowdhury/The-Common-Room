import os
import django
import base64

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'common_room_backend.settings')
django.setup()

from django.contrib.auth.models import User
from profiles.models import Profile
from profiles.storage import upload_avatar, is_cloudinary_configured
from rest_framework.test import APIRequestFactory, force_authenticate
from profiles.views import MyProfileView

print("=== STARTING AVATAR STORAGE VERIFICATION ===")

# Create a minimal 1x1 transparent GIF / JPEG in Base64
tiny_png_b64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="

# 1. Direct upload_avatar test
test_user, _ = User.objects.get_or_create(username="avatar_test_user", defaults={"email": "avatar@test.com"})
url = upload_avatar(tiny_png_b64, test_user.username)

print(f"1. Is Cloudinary Configured? {is_cloudinary_configured()}")
print(f"2. Generated Avatar URL: {url}")

assert url is not None, "Expected upload_avatar to return a valid URL!"
assert not url.startswith("data:image"), "Avatar stored in DB must NOT be Base64!"
assert url.startswith("http") or url.startswith("/media/"), f"Unexpected URL format: {url}"

# 2. Test via MyProfileView API endpoint
factory = APIRequestFactory()
view = MyProfileView.as_view()

# PUT with Base64 payload
put_request = factory.put('/api/profiles/me/', {'profile_picture': tiny_png_b64}, format='json')
force_authenticate(put_request, user=test_user)
response = view(put_request)

print(f"3. PUT /api/profiles/me/ Status: {response.status_code}")
assert response.status_code == 200, f"Expected 200, got {response.status_code}"

saved_url = response.data.get('profile_picture')
print(f"4. API Response profile_picture: {saved_url}")
assert saved_url is not None and not saved_url.startswith("data:image"), "API must return URL, not Base64!"

# 3. Check Database directly
profile = Profile.objects.get(user=test_user)
print(f"5. PostgreSQL DB column profile_picture length: {len(profile.profile_picture)} chars")
assert len(profile.profile_picture) < 500, f"Database text column is too long ({len(profile.profile_picture)}), expected clean URL!"
assert profile.profile_picture == saved_url, "DB value must match API response URL!"

# 4. Test photo removal
remove_request = factory.put('/api/profiles/me/', {'profile_picture': None}, format='json')
force_authenticate(remove_request, user=test_user)
remove_response = view(remove_request)

profile.refresh_from_db()
print(f"6. After photo removal, profile_picture in DB is: {profile.profile_picture}")
assert profile.profile_picture is None, "Expected profile_picture to be None after removal"

print("=== ALL AVATAR STORAGE TESTS PASSED SUCCESSFULLY! ===")

