from django.urls import path
from .project_api import ProjectListView

urlpatterns = [
    path("", ProjectListView.as_view(), name="project-list"),
]