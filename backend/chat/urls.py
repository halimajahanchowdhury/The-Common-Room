from django.urls import path
from .views import (
    MessageListCreateView,
    ConversationListView,
    MarkMessagesReadView,
    UnreadCountView,
)

urlpatterns = [
    path('messages/', MessageListCreateView.as_view(), name='chat_messages'),
    path('conversations/', ConversationListView.as_view(), name='chat_conversations'),
    path('read/', MarkMessagesReadView.as_view(), name='chat_read'),
    path('unread_count/', UnreadCountView.as_view(), name='chat_unread_count'),
]
