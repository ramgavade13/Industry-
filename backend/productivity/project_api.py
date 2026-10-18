from datetime import date

from django.db.models import Q
from rest_framework import serializers
from rest_framework.generics import ListAPIView

from accounts.permissions import CEO_ADMIN_MANAGER
from risk.models import RiskAlert
from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
    manager = serializers.SerializerMethodField()
    budget = serializers.FloatField()
    spent = serializers.FloatField()
    budget_used_pct = serializers.SerializerMethodField()
    days_left = serializers.SerializerMethodField()
    risk = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id", "name", "status", "progress", "team", "team_size",
            "budget", "spent", "budget_used_pct", "end_date", "days_left",
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


class ProjectListView(ListAPIView):
    """
    Project list with progress, budget and risk level.
    Executives/Admins see every project; a Manager sees their own.
    Optional filters: ?q=<text in name or team>  and  ?status=<planning|active|on_hold|completed>
    """
    permission_classes = [CEO_ADMIN_MANAGER]
    serializer_class = ProjectSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Project.objects.select_related("manager")
        if not (user.role in ["ceo", "admin"] or user.is_superuser):
            qs = qs.filter(manager=user)

        q = self.request.query_params.get("q", "").strip()
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(team__icontains=q))

        status = self.request.query_params.get("status", "").strip()
        if status:
            qs = qs.filter(status=status)
        return qs.order_by("name")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["risk_by_project"] = dict(
            RiskAlert.objects.exclude(project_ref_id=None).values_list("project_ref_id", "severity")
        )
        return context