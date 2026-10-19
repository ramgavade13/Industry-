from django.urls import path
from .views import (
    ForecastListView,
    ForecastNoteListView,
    ForecastSummaryView,
    ProjectForecastView,
)

urlpatterns = [
    path("revenue/", ForecastListView.as_view(), name="forecast-revenue"),
    path("notes/", ForecastNoteListView.as_view(), name="forecast-notes"),
    path("summary/", ForecastSummaryView.as_view(), name="forecast-summary"),
    path("projects/", ProjectForecastView.as_view(), name="forecast-projects"),
]