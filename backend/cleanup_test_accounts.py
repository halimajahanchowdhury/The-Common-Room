import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "common_room_backend.settings")
django.setup()

from django.contrib.auth.models import User

test_prefixes = ["student1_", "student2_", "stage8_", "collab_", "post_", "chat_", "skill_", "search_", "test_student"]
extra_delete = ["student_one", "student_two"]

deleted_count = 0

for u in User.objects.all():
    is_test = any(u.username.startswith(prefix) for prefix in test_prefixes) or u.username in extra_delete
    if is_test:
        u.delete()
        deleted_count += 1

print(f"Successfully deleted {deleted_count} test accounts from PostgreSQL database!")

print("\n=== REMAINING ACTIVE ACCOUNTS ===")
remaining_users = User.objects.all().order_by("id")
for u in remaining_users:
    # Set password to Password123! for convenience
    u.set_password("Password123!")
    u.save()
    print(f"ID: {u.id} | Username: '{u.username}' | Email: '{u.email}' | Password: 'Password123!'")
