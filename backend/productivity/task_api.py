from datetime import date

from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import serializers
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import CEO_ADMIN_MANAGER
from .models import Project, Task
from .project_api import _is_executive, _visible_projects

User = get_user_model()


def _visible_tasks(user):
    """Executives/Admins see every task, a Manager their team's tasks, an Employee their own."""
    qs = Task.objects.select_related("assignee", "manager", "project")
    if _is_executive(user):
        return qs
    if user.role == "manager":
        return qs.filter(manager=user)
    return qs.filter(assignee=user)


class TaskSerializer(serializers.ModelSerializer):
    """Read format: what the task pages show."""
    member = serializers.SerializerMethodField()
    project = serializers.SerializerMethodField()
    project_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Task
        fields = [
            "id", "task", "member", "assignee", "project", "project_id",
            "due", "due_date", "status", "priority",
        ]

    def get_member(self, obj):
        return obj.assignee.first_name or obj.assignee.username

    def get_project(self, obj):
        return obj.project.name if obj.project else ""


class TaskWriteSerializer(serializers.ModelSerializer):
    """Create / edit format for managers, with the validation rules."""
    assignee = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role="employee", is_active=True),
        error_messages={
            "does_not_exist": "Pick an employee from the list.",
            "incorrect_type": "Pick an employee from the list.",
            "null": "Pick an employee from the list.",
            "required": "Pick an employee from the list.",
        },
    )
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all(), allow_null=True, required=False)

    class Meta:
        model = Task
        fields = ["task", "assignee", "project", "due_date", "status", "priority"]
        extra_kwargs = {"due_date": {"required": True, "allow_null": False}}

    def validate_task(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Task title is required.")
        return value

    def validate_project(self, value):
        if value and not _visible_projects(self.context["request"].user).filter(pk=value.pk).exists():
            raise serializers.ValidationError("You can only use your own projects.")
        return value

    def validate_due_date(self, value):
        changed = self.instance is None or value != self.instance.due_date
        if changed and value < date.today():
            raise serializers.ValidationError("Due date cannot be in the past.")
        return value

    def to_representation(self, instance):
        return TaskSerializer(instance, context=self.context).data


class TaskStatusSerializer(serializers.ModelSerializer):
    """What an employee may change on their own task: only the status."""

    class Meta:
        model = Task
        fields = ["status"]

    def to_representation(self, instance):
        return TaskSerializer(instance, context=self.context).data


class TaskListView(ListCreateAPIView):
    """
    GET  - tasks the user may see. Optional filters: ?q=<title or person>, ?status=, ?project=<id>
    POST - create and assign a task (CEO, Admin, Manager).
    """

    def get_permissions(self):
        if self.request.method == "POST":
            return [CEO_ADMIN_MANAGER()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        return TaskWriteSerializer if self.request.method == "POST" else TaskSerializer

    def get_queryset(self):
        qs = _visible_tasks(self.request.user)

        q = self.request.query_params.get("q", "").strip()
        if q:
            qs = qs.filter(
                Q(task__icontains=q) | Q(assignee__first_name__icontains=q) | Q(assignee__username__icontains=q)
            )
        status = self.request.query_params.get("status", "").strip()
        if status:
            qs = qs.filter(status=status)
        project = self.request.query_params.get("project", "").strip()
        if project.isdigit():
            qs = qs.filter(project_id=int(project))
        return qs.order_by("due_date", "id")

    def perform_create(self, serializer):
        user = self.request.user
        project = serializer.validated_data.get("project")
        manager = user if user.role == "manager" else (project.manager if project else None)
        serializer.save(manager=manager)


class TaskDetailView(RetrieveUpdateDestroyAPIView):
    """
    GET / PATCH - the task's owner team. An Employee may only change the status of their own task.
    DELETE      - CEO, Admin, Manager.
    """

    def get_permissions(self):
        if self.request.method == "DELETE":
            return [CEO_ADMIN_MANAGER()]
        return [IsAuthenticated()]

    def get_queryset(self):
        return _visible_tasks(self.request.user)

    def get_serializer_class(self):
        if self.request.method == "GET":
            return TaskSerializer
        if self.request.user.role == "employee" and not self.request.user.is_superuser:
            return TaskStatusSerializer
        return TaskWriteSerializer


class TaskOptionsView(APIView):
    """People and projects to pick from in the task form."""
    permission_classes = [CEO_ADMIN_MANAGER]

    def get(self, request):
        employees = User.objects.filter(role="employee", is_active=True).order_by("first_name", "username")
        projects = _visible_projects(request.user).order_by("name")
        return Response({
            "employees": [{"id": u.pk, "name": u.first_name or u.username} for u in employees],
            "projects": [{"id": p.pk, "name": p.name} for p in projects],
        })