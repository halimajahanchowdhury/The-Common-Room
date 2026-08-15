import os
import django
from django.db import connection

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "common_room_backend.settings")
django.setup()

with connection.cursor() as cursor:
    cursor.execute("ALTER TABLE profiles_profile ALTER COLUMN profile_picture TYPE text;")
    print("Successfully altered PostgreSQL profiles_profile.profile_picture column to TEXT!")
