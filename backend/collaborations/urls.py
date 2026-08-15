from django.urls import path
from .views import (
    CreateCollaborationRequestView,
    SentCollaborationRequestsView,
    ReceivedCollaborationRequestsView,
    UpdateCollaborationRequestView,
    CollaborationStatusView,
)

urlpatterns = [
    path('create/', CreateCollaborationRequestView.as_view(), name='collab_create'),
    path('sent/', SentCollaborationRequestsView.as_view(), name='collab_sent'),
    path('received/', ReceivedCollaborationRequestsView.as_view(), name='collab_received'),
    path('<int:pk>/', UpdateCollaborationRequestView.as_view(), name='collab_update'),
    path('status/<int:user_id>/', CollaborationStatusView.as_view(), name='collab_status'),
]
