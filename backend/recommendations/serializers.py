from rest_framework import serializers
from .models import Recommendation


class RecommendationSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="pk")
    status = serializers.SerializerMethodField()
    decided_by = serializers.SerializerMethodField()
    decided_at = serializers.SerializerMethodField()

    class Meta:
        model = Recommendation
        fields = [
            "id", "title", "problem", "evidence", "action", "impact", "confidence",
            "status", "decided_by", "decided_at",
        ]

    def _decision(self, obj):
        return self.context.get("decisions", {}).get(obj.title)

    def get_status(self, obj):
        decision = self._decision(obj)
        return decision.status if decision else "New"

    def get_decided_by(self, obj):
        decision = self._decision(obj)
        if not decision or not decision.decided_by:
            return ""
        user = decision.decided_by
        return user.first_name or user.username

    def get_decided_at(self, obj):
        decision = self._decision(obj)
        return decision.decided_at.isoformat() if decision else None