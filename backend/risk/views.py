from rest_framework.generics import ListAPIView
from .models import RiskAlert
from .serializers import RiskAlertSerializer

class RiskAlertListView(ListAPIView):
    queryset = RiskAlert.objects.all()
    serializer_class = RiskAlertSerializer