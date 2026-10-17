from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from accounts.permissions import CEO_ADMIN
from finance.models import RevenueMonth
from .ml.summary import build_summary_cards
from .models import Forecast, ForecastNote
from .serializers import ForecastSerializer, ForecastNoteSerializer


class ForecastListView(ListAPIView):
    permission_classes = [CEO_ADMIN]
    queryset = Forecast.objects.all()
    serializer_class = ForecastSerializer


class ForecastNoteListView(ListAPIView):
    permission_classes = [CEO_ADMIN]
    queryset = ForecastNote.objects.all()
    serializer_class = ForecastNoteSerializer


class ForecastSummaryView(APIView):
    """The four summary cards, computed from the revenue history with the same
    trend model that produces the forecast chart."""
    permission_classes = [CEO_ADMIN]

    def get(self, request):
        history = list(RevenueMonth.objects.order_by("id"))
        revenue = [h.revenue for h in history]
        expenses = [h.expenses for h in history]
        return Response(build_summary_cards(revenue, expenses))