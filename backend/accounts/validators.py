import re
from django.core.exceptions import ValidationError

class ComplexPasswordValidator:
    """
    Validates that a password satisfies strong security requirements:
    1. Minimum 8 characters
    2. At least 1 uppercase letter (A-Z)
    3. At least 1 lowercase letter (a-z)
    4. At least 1 numeric digit (0-9)
    5. At least 1 special character (!@#$%^&*()_+-=[]{}|;:,.<>? etc.)
    """

    def validate(self, password, user=None):
        if not password or len(password) < 8:
            raise ValidationError("Password must be at least 8 characters long.")

        if not re.search(r"[A-Z]", password):
            raise ValidationError("Password must contain at least one uppercase letter (A-Z).")

        if not re.search(r"[a-z]", password):
            raise ValidationError("Password must contain at least one lowercase letter (a-z).")

        if not re.search(r"[0-9]", password):
            raise ValidationError("Password must contain at least one number (0-9).")

        if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>/?`~]", password):
            raise ValidationError("Password must contain at least one special character (!@#$%^&*...).")

    def get_help_text(self):
        return (
            "Your password must contain at least 8 characters, "
            "including at least one uppercase letter, one lowercase letter, one number, and one special character."
        )
