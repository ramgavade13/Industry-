from rest_framework.generics import ListAPIView
from .models import KPI, RevenueMonth
from .serializers import KPISerializer, RevenueMonthSerializer

class KPIListView(ListAPIView):
    queryset = KPI.objects.all()
    serializer_class = KPISerializer


class RevenueTrendView(ListAPIView):
    queryset = RevenueMonth.objects.all()
    serializer_class = RevenueMonthSerializer