from datetime import date, timedelta

from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import CEO_ADMIN_MANAGER, IsManager
from .models import TeamProductivity, WorkloadItem, Task
from .serializers import (
    TeamProductivitySerializer,
    WorkloadItemSerializer,
    TeamTaskSerializer,
    MyTaskSerializer,
)


def _team_tasks_for(user):
    """Executives and admins see every task; a manager sees the tasks of their own team."""
    if user.role in ["ceo", "admin"] or user.is_superuser:
        return Task.objects.all()
    return Task.objects.filter(manager=user)


class TeamProductivityListView(ListAPIView):
    """
    Team productivity metrics.
    Accessible to Managers, Executives (CEO), and Administrators.
    """
    permission_classes = [CEO_ADMIN_MANAGER]
    queryset = TeamProductivity.objects.all()
    serializer_class = TeamProductivitySerializer


class WorkloadListView(ListAPIView):
    """
    Workload distribution across team members.
    Accessible to Managers, Executives (CEO), and Administrators.
    """
    permission_classes = [CEO_ADMIN_MANAGER]
    queryset = WorkloadItem.objects.all()
    serializer_class = WorkloadItemSerializer


class ManagerTasksView(ListAPIView):
    """
    Manager view of team tasks.
    Executives/Admins can view all tasks; Managers see their team tasks.
    """
    permission_classes = [CEO_ADMIN_MANAGER]
    serializer_class = TeamTaskSerializer

    def get_queryset(self):
        return (
            _team_tasks_for(self.request.user)
            .select_related("assignee", "project")
            .order_by("due_date", "id")
        )


class EmployeeTasksView(ListAPIView):
    """
    Employee personal task list.
    Filtered strictly to tasks assigned to the authenticated user.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = MyTaskSerializer

    def get_queryset(self):
        return (
            Task.objects.filter(assignee=self.request.user)
            .select_related("project")
            .order_by("due_date", "id")
        )


class ManagerOverviewView(APIView):
    """
    Manager summary KPI cards, calculated from the task table.
    Accessible to Managers, Executives (CEO), and Administrators.
    """
    permission_classes = [CEO_ADMIN_MANAGER]

    def get(self, request):
        tasks = _team_tasks_for(request.user)
        today = date.today()

        total = tasks.count()
        members = tasks.values("assignee").distinct().count()
        completed = tasks.filter(status="Completed").count()
        delayed = tasks.filter(status="Delayed").count()
        percent = round((completed / total) * 100) if total else 0

        upcoming = (
            tasks.exclude(status="Completed")
            .filter(due_date__gte=today)
            .order_by("due_date")
            .first()
        )
        if upcoming:
            days = (upcoming.due_date - today).days
            next_deadline = "Today" if days == 0 else f"{days} day{'s' if days != 1 else ''}"
        else:
            next_deadline = "None"

        return Response([
            {"label": "Team Size", "value": str(members), "change": "", "trend": "up"},
            {"label": "Tasks Completed", "value": f"{percent}%", "change": "", "trend": "up"},
            {"label": "Delayed Tasks", "value": str(delayed), "change": "", "trend": "down"},
            {"label": "Next Deadline", "value": next_deadline, "change": "", "trend": "down"},
        ])


class EmployeeStatsView(APIView):
    """
    Employee personal task metrics.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        mine = Task.objects.filter(assignee=request.user)
        total = mine.count()
        completed = mine.filter(status="Completed").count()
        due_this_week = (
            mine.exclude(status="Completed")
            .filter(due_date__lte=date.today() + timedelta(days=7))
            .count()
        )

        return Response([
            {"label": "Tasks Assigned", "value": str(total), "change": "", "trend": "up"},
            {"label": "Completed", "value": str(completed), "change": "", "trend": "up"},
            {"label": "Due This Week", "value": str(due_this_week), "change": "", "trend": "down"},
        ])