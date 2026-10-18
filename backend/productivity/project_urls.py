from django.urls import path
from .project_api import ProjectListView, ProjectDetailView

urlpatterns = [
    path("", ProjectListView.as_view(), name="project-list"),
    path("<int:pk>/", ProjectDetailView.as_view(), name="project-detail"),
]