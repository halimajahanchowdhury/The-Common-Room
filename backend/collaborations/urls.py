from django.urls import path

from .views import (
    CreateCollaborationRequestView,
    ReceivedCollaborationRequestsView,
    SentCollaborationRequestsView,
    UpdateCollaborationRequestView,
    CollaborationStatusView,
)


urlpatterns = [

    path(
        "create/",
        CreateCollaborationRequestView.as_view(),
        name="create-collaboration-request"
    ),

    path(
        "received/",
        ReceivedCollaborationRequestsView.as_view(),
        name="received-collaboration-requests"
    ),

    path(
        "sent/",
        SentCollaborationRequestsView.as_view(),
        name="sent-collaboration-requests"
    ),

    path(
        "status/<int:user_id>/",
        CollaborationStatusView.as_view(),
        name="collaboration-status"
    ),

    path(
        "<int:pk>/",
        UpdateCollaborationRequestView.as_view(),
        name="update-collaboration-request"
    ),

]


