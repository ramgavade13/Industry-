from django.urls import path
from .views import RecommendationDecisionView, RecommendationListView

urlpatterns = [
    path("", RecommendationListView.as_view(), name="recommendations-list"),
    path("<int:pk>/", RecommendationDecisionView.as_view(), name="recommendation-decision"),
]