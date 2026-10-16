from rest_framework.generics import ListAPIView
from accounts.permissions import CEO_ADMIN, CEO_ADMIN_MANAGER
from .models import KPI, RevenueMonth
from .serializers import KPISerializer, RevenueMonthSerializer


class KPIListView(ListAPIView):
    permission_classes = [CEO_ADMIN_MANAGER]
    queryset = KPI.objects.all()
    serializer_class = KPISerializer


class RevenueTrendView(ListAPIView):
    permission_classes = [CEO_ADMIN]
    queryset = RevenueMonth.objects.all()
    serializer_class = RevenueMonthSerializer