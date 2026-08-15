from django.urls import path
from .views import (
    PostListCreateView,
    PostDetailDeleteView,
    PostCommentCreateView,
    CommentDeleteView,
    ProfileCommentListView,
    ProfileCommentCreateView,
)

urlpatterns = [
    path('', PostListCreateView.as_view(), name='post_list_create'),
    path('<int:pk>/', PostDetailDeleteView.as_view(), name='post_detail_delete'),
    path('<int:pk>/comments/', PostCommentCreateView.as_view(), name='post_comment_create'),
    path('profile/<int:profile_id>/', ProfileCommentListView.as_view(), name='profile_comment_list'),
    path('create/', ProfileCommentCreateView.as_view(), name='profile_comment_create'),
]
