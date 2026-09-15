from rest_framework import serializers
from .models import Recommendation


class RecommendationSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="pk")

    class Meta:
        model = Recommendation
        fields = ["id", "title", "problem", "evidence", "action", "impact", "confidence"]