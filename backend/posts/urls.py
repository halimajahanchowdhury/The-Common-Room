from django.urls import path

from .views import (
    CreateCommentView,
    ProfileCommentsView,
)


urlpatterns = [

    path(
        "create/",
        CreateCommentView.as_view(),
        name="create-comment"
    ),

    path(
        "profile/<int:profile_id>/",
        ProfileCommentsView.as_view(),
        name="profile-comments"
    ),

]
