from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/profiles/', include('profiles.urls')),
    path('api/posts/', include('posts.urls')),
    path('api/collaborations/', include('collaborations.urls')),
    path('api/chat/', include('chat.urls')),
    path('api/study-sessions/', include('study_sessions.urls')),
]