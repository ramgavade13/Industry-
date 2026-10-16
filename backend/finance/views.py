from rest_framework.generics import ListAPIView
from accounts.permissions import CEO_ONLY
from .models import KPI, RevenueMonth
from .serializers import KPISerializer, RevenueMonthSerializer


class KPIListView(ListAPIView):
    permission_classes = [CEO_ONLY]
    queryset = KPI.objects.all()
    serializer_class = KPISerializer


class RevenueTrendView(ListAPIView):
    permission_classes = [CEO_ONLY]
    queryset = RevenueMonth.objects.all()
    serializer_class = RevenueMonthSerializer