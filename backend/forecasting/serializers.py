from rest_framework import serializers
from .models import Forecast, ForecastNote


class ForecastSerializer(serializers.ModelSerializer):
    class Meta:
        model = Forecast
        fields = ["month", "actual", "forecast"]


class ForecastNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForecastNote
        fields = ["title", "detail"]