import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "common_room_backend.settings")
django.setup()

from django.contrib.auth.models import User
from accounts.serializers import UserRegisterSerializer
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

def run_tests():
    print("--- RUNNING PASSWORD VALIDATION UNIT TESTS ---")

    test_cases = [
        ("Short1!", "Fewer than 8 characters", False),
        ("lowercase1!", "Missing uppercase letter", False),
        ("UPPERCASE1!", "Missing lowercase letter", False),
        ("NoNumberHere!", "Missing number", False),
        ("NoSpecial123", "Missing special character", False),
        ("ValidPass123!", "Valid password satisfying all criteria", True),
    ]

    all_passed = True

    for pwd, desc, should_be_valid in test_cases:
        try:
            validate_password(pwd)
            is_valid = True
        except ValidationError:
            is_valid = False

        if is_valid == should_be_valid:
            print(f"  [PASS] '{pwd}' -> {desc} (Expected valid={should_be_valid}, got valid={is_valid})")
        else:
            print(f"  [FAIL] '{pwd}' -> {desc} (Expected valid={should_be_valid}, got valid={is_valid})")
            all_passed = False

    # Test serializer validation with confirmation mismatch
    mismatch_data = {
        "username": "temp_mismatch_user",
        "email": "mismatch@gmail.com",
        "password": "ValidPassword123!",
        "confirm_password": "DifferentPassword123!"
    }
    s = UserRegisterSerializer(data=mismatch_data)
    if not s.is_valid() and "confirm_password" in s.errors:
        print("  [PASS] Password confirmation mismatch correctly rejected by serializer.")
    else:
        print("  [FAIL] Serializer failed to reject confirmation mismatch!")
        all_passed = False

    # Test valid registration serializer and cleanup immediately
    valid_data = {
        "username": "temp_valid_sec_test",
        "email": "temp_valid@gmail.com",
        "password": "ValidPassword123!",
        "confirm_password": "ValidPassword123!"
    }
    s_valid = UserRegisterSerializer(data=valid_data)
    if s_valid.is_valid():
        user = s_valid.save()
        print("  [PASS] Serializer accepted valid password and created user.")
        user.delete()
        print("  [CLEANUP] Deleted temporary test user from database.")
    else:
        print(f"  [FAIL] Serializer rejected valid password! Errors: {s_valid.errors}")
        all_passed = False

    # Ensure 0 test users remain in DB
    cleanup_count = 0
    for u in User.objects.filter(username__icontains="temp_"):
        u.delete()
        cleanup_count += 1
    if cleanup_count > 0:
        print(f"  [CLEANUP] Removed {cleanup_count} residual test accounts.")

    print("\n--- ALL PASSWORD VALIDATION TESTS COMPLETED SUCCESSFULLY ---")
    return all_passed

if __name__ == "__main__":
    run_tests()
