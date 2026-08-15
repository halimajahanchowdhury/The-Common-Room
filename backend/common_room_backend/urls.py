from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from accounts.views import CustomTokenObtainPairView
from posts.views import CommentDeleteView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Authentication & JWT Endpoints
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Apps Endpoints
    path('api/accounts/', include('accounts.urls')),
    path('api/profiles/', include('profiles.urls')),
    path('api/collaborations/', include('collaborations.urls')),
    path('api/posts/', include('posts.urls')),
    path('api/comments/<int:pk>/', CommentDeleteView.as_view(), name='comment_delete'),
    path('api/chat/', include('chat.urls')),
]
