from rest_framework import serializers
from .models import KPI, RevenueMonth

class KPISerializer(serializers.ModelSerializer):
    class Meta:
        model = KPI
        fields = ["label", "value", "change", "trend"]


class RevenueMonthSerializer(serializers.ModelSerializer):
    class Meta:
        model = RevenueMonth
        fields = ["month", "revenue", "expenses"]