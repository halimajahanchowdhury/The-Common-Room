from django.apps import AppConfig


class ProfilesConfig(AppConfig):
    name = 'profiles'

    def ready(self):
        try:
            import profiles.signals  # noqa
        except Exception:
            pass

