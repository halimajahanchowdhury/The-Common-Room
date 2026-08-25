import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "common_room_backend.settings")
django.setup()

from django.contrib.auth.models import User

test_prefixes = ["student1_", "student2_", "stage8_", "collab_", "post_", "chat_", "skill_", "search_", "test_student"]

real_users = []
test_users = []

for u in User.objects.all().order_by("id"):
    is_test = any(u.username.startswith(prefix) for prefix in test_prefixes)
    if is_test:
        test_users.append(u)
    else:
        real_users.append(u)

print("=== REAL USER ACCOUNTS (TO KEEP) ===")
for u in real_users:
    print(f"ID: {u.id} | Username: '{u.username}' | Email: '{u.email}'")

print("\n=== TEST ACCOUNTS (TO DELETE) ===")
print(f"Count of test accounts to delete: {len(test_users)}")
