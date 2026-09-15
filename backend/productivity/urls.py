from django.urls import path
from .views import (
    TeamProductivityListView,
    WorkloadListView,
    ManagerTasksView,
    ManagerOverviewView,
    EmployeeTasksView,
    EmployeeStatsView,
)

urlpatterns = [
    path("productivity/", TeamProductivityListView.as_view(), name="productivity-list"),
    path("productivity/workload/", WorkloadListView.as_view(), name="workload-list"),
    path("manager/tasks/", ManagerTasksView.as_view(), name="manager-tasks"),
    path("manager/overview/", ManagerOverviewView.as_view(), name="manager-overview"),
    path("employee/tasks/", EmployeeTasksView.as_view(), name="employee-tasks"),
    path("employee/stats/", EmployeeStatsView.as_view(), name="employee-stats"),
]