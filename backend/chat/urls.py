from django.urls import path
from .views import ChatSessionDetailView, ChatSessionListView, ChatView

urlpatterns = [
    path("", ChatView.as_view(), name="chat"),
    path("sessions/", ChatSessionListView.as_view(), name="chat-sessions"),
    path("sessions/<int:pk>/", ChatSessionDetailView.as_view(), name="chat-session"),
]