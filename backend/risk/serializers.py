from rest_framework import serializers
from .models import RiskAlert


class RiskAlertSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()
    budget_used_pct = serializers.SerializerMethodField()

    class Meta:
        model = RiskAlert
        fields = ["project", "risk", "severity", "score", "progress", "budget_used_pct"]

    def get_progress(self, obj):
        p = getattr(obj, "project_ref", None)
        return p.progress if p else None

    def get_budget_used_pct(self, obj):
        p = getattr(obj, "project_ref", None)
        if not p or not p.budget:
            return None
        return round(float(p.spent) / float(p.budget) * 100, 1)