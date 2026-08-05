from django.urls import path

from .views import CreateCollaborationRequestView


urlpatterns = [

    path(
        "create/",
        CreateCollaborationRequestView.as_view(),
        name="create-collaboration-request"
    ),

]
