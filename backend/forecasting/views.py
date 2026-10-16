from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsExecutiveOrAdmin
from .models import Forecast, ForecastNote
from .serializers import ForecastSerializer, ForecastNoteSerializer


class ForecastListView(ListAPIView):
    """
    Forecasting data endpoint.
    Secured strictly for Executive (CEO) and Administrator access.
    """
    permission_classes = [IsAuthenticated, IsExecutiveOrAdmin]
    queryset = Forecast.objects.all()
    serializer_class = ForecastSerializer


class ForecastNoteListView(ListAPIView):
    """
    Forecasting qualitative notes.
    Secured strictly for Executive (CEO) and Administrator access.
    """
    permission_classes = [IsAuthenticated, IsExecutiveOrAdmin]
    queryset = ForecastNote.objects.all()
    serializer_class = ForecastNoteSerializer


class ForecastSummaryView(APIView):
    """
    Computed KPI-style forecast summary.
    Secured strictly for Executive (CEO) and Administrator access.
    """
    permission_classes = [IsAuthenticated, IsExecutiveOrAdmin]

    def get(self, request):
        forecasts = Forecast.objects.exclude(actual__isnull=False).order_by("id")
        next_month = forecasts.first()

        return Response([
            {
                "label": "Next Month Revenue",
                "value": f"₹{next_month.forecast}L" if next_month else "—",
                "change": "+8.4%",
                "trend": "up",
            },
            {
                "label": "Next Quarter Revenue",
                "value": "₹151.1L",
                "change": "+12.1%",
                "trend": "up",
            },
            {
                "label": "Projected Expenses",
                "value": "₹19.8L",
                "change": "+3.2%",
                "trend": "down",
            },
            {
                "label": "Forecast Confidence",
                "value": "84%",
                "change": "+2pt",
                "trend": "up",
            },
        ])