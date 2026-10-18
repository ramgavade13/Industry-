from django.urls import path
from .task_api import TaskListView, TaskDetailView, TaskOptionsView

urlpatterns = [
    path("", TaskListView.as_view(), name="task-list"),
    path("options/", TaskOptionsView.as_view(), name="task-options"),
    path("<int:pk>/", TaskDetailView.as_view(), name="task-detail"),
]