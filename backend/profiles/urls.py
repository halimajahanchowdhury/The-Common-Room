from django.urls import path
from .views import MyProfileView, ProfileListView, ProfileDetailView

urlpatterns = [
    path('', ProfileListView.as_view(), name='profile_list'),
    path('me/', MyProfileView.as_view(), name='my_profile'),
    path('<int:pk>/', ProfileDetailView.as_view(), name='profile_detail'),
]
