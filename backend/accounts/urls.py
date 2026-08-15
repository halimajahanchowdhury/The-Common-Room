from django.urls import path
from .views import RegisterView, CurrentUserView, PasswordResetView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('password_reset/', PasswordResetView.as_view(), name='password_reset'),
]
