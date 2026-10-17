from rest_framework import serializers
from .models import RiskAlert

class RiskAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiskAlert
        fields = ["project", "risk", "severity"]