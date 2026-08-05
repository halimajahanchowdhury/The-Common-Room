from django.urls import path
from .views import ProfileView, ProfileListView

urlpatterns = [
    path("", ProfileListView.as_view(), name="profile-list"),
    path("me/", ProfileView.as_view(), name="profile"),
]