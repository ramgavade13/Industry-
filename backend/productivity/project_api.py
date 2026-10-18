from datetime import date

from django.db.models import Q
from rest_framework import serializers
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from accounts.permissions import CEO_ADMIN, CEO_ADMIN_MANAGER
from risk.models import RiskAlert
from .models import Project


def _is_executive(user):
    return user.role in ["ceo", "admin"] or user.is_superuser


def _visible_projects(user):
    """Executives/Admins see every project; a Manager sees their own."""
    qs = Project.objects.select_related("manager")
    return qs if _is_executive(user) else qs.filter(manager=user)


class ProjectSerializer(serializers.ModelSerializer):
    """Read format: what the Projects page shows."""
    manager = serializers.SerializerMethodField()
    budget = serializers.FloatField()
    spent = serializers.FloatField()
    budget_used_pct = serializers.SerializerMethodField()
    days_left = serializers.SerializerMethodField()
    risk = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id", "name", "description", "status", "progress", "team", "team_size",
            "budget", "spent", "budget_used_pct", "start_date", "end_date", "days_left",
            "manager", "risk",
        ]

    def get_manager(self, obj):
        if not obj.manager:
            return ""
        return obj.manager.first_name or obj.manager.username

    def get_budget_used_pct(self, obj):
        return round(float(obj.spent) / float(obj.budget) * 100, 1) if obj.budget else 0.0

    def get_days_left(self, obj):
        return (obj.end_date - date.today()).days if obj.end_date else None

    def get_risk(self, obj):
        # "high" / "medium" from the latest AI run, otherwise "low"
        return self.context.get("risk_by_project", {}).get(obj.pk, "low")


class ProjectWriteSerializer(serializers.ModelSerializer):
    """Create / edit format, with the validation rules."""

    class Meta:
        model = Project
        fields = [
            "name", "description", "status", "progress", "team", "team_size",
            "budget", "spent", "start_date", "end_date",
        ]

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Project name is required.")
        clash = Project.objects.filter(name__iexact=value)
        if self.instance:
            clash = clash.exclude(pk=self.instance.pk)
        if clash.exists():
            raise serializers.ValidationError("A project with this name already exists.")
        return value

    def validate_budget(self, value):
        if value < 0:
            raise serializers.ValidationError("Budget cannot be negative.")
        return value

    def validate_spent(self, value):
        if value < 0:
            raise serializers.ValidationError("Amount spent cannot be negative.")
        return value

    def validate(self, attrs):
        start = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end = attrs.get("end_date", getattr(self.instance, "end_date", None))
        if start and end and end < start:
            raise serializers.ValidationError({"end_date": "End date must be on or after the start date."})
        return attrs

    def to_representation(self, instance):
        # Answer with the same format as the list, so the page can use it straight away.
        return ProjectSerializer(instance, context=self.context).data


class RiskContextMixin:
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["risk_by_project"] = dict(
            RiskAlert.objects.exclude(project_ref_id=None).values_list("project_ref_id", "severity")
        )
        return context


class ProjectListView(RiskContextMixin, ListCreateAPIView):
    """
    GET  - project list with progress, budget and risk level.
           Optional filters: ?q=<text in name or team>  and  ?status=<planning|active|on_hold|completed>
    POST - create a project (CEO, Admin, Manager). A manager becomes the project's manager.
    """
    permission_classes = [CEO_ADMIN_MANAGER]

    def get_serializer_class(self):
        return ProjectWriteSerializer if self.request.method == "POST" else ProjectSerializer

    def get_queryset(self):
        qs = _visible_projects(self.request.user)

        q = self.request.query_params.get("q", "").strip()
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(team__icontains=q))

        status = self.request.query_params.get("status", "").strip()
        if status:
            qs = qs.filter(status=status)
        return qs.order_by("name")

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(manager=user if user.role == "manager" else None)


class ProjectDetailView(RiskContextMixin, RetrieveUpdateDestroyAPIView):
    """
    GET / PATCH - CEO, Admin, Manager (a manager only for their own projects).
    DELETE      - CEO and Admin only.
    """

    def get_permissions(self):
        if self.request.method == "DELETE":
            return [CEO_ADMIN()]
        return [CEO_ADMIN_MANAGER()]

    def get_serializer_class(self):
        return ProjectSerializer if self.request.method == "GET" else ProjectWriteSerializer

    def get_queryset(self):
        return _visible_projects(self.request.user)

    def perform_destroy(self, instance):
        # Remove the project's risk alert too, so no orphan alert stays on the dashboard.
        RiskAlert.objects.filter(project_ref_id=instance.pk).delete()
        instance.delete()