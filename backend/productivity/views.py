from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import TeamProductivity, WorkloadItem, Task
from .serializers import (
    TeamProductivitySerializer,
    WorkloadItemSerializer,
    TeamTaskSerializer,
    MyTaskSerializer,
)


class TeamProductivityListView(ListAPIView):
    queryset = TeamProductivity.objects.all()
    serializer_class = TeamProductivitySerializer


class WorkloadListView(ListAPIView):
    queryset = WorkloadItem.objects.all()
    serializer_class = WorkloadItemSerializer


class ManagerTasksView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TeamTaskSerializer

    def get_queryset(self):
        return Task.objects.filter(manager=self.request.user)


class EmployeeTasksView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MyTaskSerializer

    def get_queryset(self):
        return Task.objects.filter(assignee=self.request.user)


class ManagerOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        team_tasks = Task.objects.filter(manager=request.user)
        total = team_tasks.count()
        completed = team_tasks.filter(status="On track").count()
        blockers = team_tasks.filter(status="At risk").count()
        percent = round((completed / total) * 100) if total else 0

        return Response([
            {"label": "Team Size", "value": str(total), "change": "", "trend": "up"},
            {"label": "Tasks Completed", "value": f"{percent}%", "change": "", "trend": "up"},
            {"label": "Open Blockers", "value": str(blockers), "change": "", "trend": "down"},
            {"label": "Sprint Deadline", "value": "3 days", "change": "", "trend": "down"},
        ])


class EmployeeStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        my_tasks = Task.objects.filter(assignee=request.user)
        total = my_tasks.count()
        completed = my_tasks.filter(status="On track").count()
        due_soon = my_tasks.exclude(status="On track").count()

        return Response([
            {"label": "Tasks Assigned", "value": str(total), "change": "", "trend": "up"},
            {"label": "Completed", "value": str(completed), "change": "", "trend": "up"},
            {"label": "Due This Week", "value": str(due_soon), "change": "", "trend": "down"},
        ])