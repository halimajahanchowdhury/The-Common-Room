from django.urls import path

from .views import (
    ProfileView,
    ProfileListView,
    ProfileDetailView,
)


urlpatterns = [

    path("", ProfileListView.as_view(), name="profile-list"),

    path("me/", ProfileView.as_view(), name="profile"),

    path("<int:pk>/", ProfileDetailView.as_view(), name="profile-detail"),

]

