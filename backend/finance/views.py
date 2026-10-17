from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response

from accounts.permissions import CEO_ADMIN, CEO_ADMIN_MANAGER
from .analysis import build_executive_analysis
from .models import KPI, RevenueMonth
from .serializers import KPISerializer, RevenueMonthSerializer


class KPIListView(ListAPIView):
    """
    KPI monitoring endpoint.
    Accessible to Managers, Executives (CEO), and Administrators.
    """
    permission_classes = [CEO_ADMIN_MANAGER]
    queryset = KPI.objects.all()
    serializer_class = KPISerializer


class RevenueTrendView(ListAPIView):
    """
    Confidential financial insights and monthly revenue/expenses trend.
    Secured strictly for Executive (CEO) and Administrator access.
    """
    permission_classes = [CEO_ADMIN]
    queryset = RevenueMonth.objects.all()
    serializer_class = RevenueMonthSerializer


class ExecutiveAnalysisView(APIView):
    """
    Consolidated executive analysis for the CEO and Administrator.
    Combines finance, the AI project-risk model, productivity and recommendations.
    Secured strictly for Executive (CEO) and Administrator access.
    """
    permission_classes = [CEO_ADMIN]

    def get(self, request):
        return Response(build_executive_analysis())