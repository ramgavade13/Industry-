from django.urls import path
from .views import VoiceQueryView

urlpatterns = [
    path("query/", VoiceQueryView.as_view(), name="voice-query"),
]