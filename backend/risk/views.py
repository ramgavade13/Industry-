from rest_framework.generics import ListAPIView
from accounts.permissions import CEO_ADMIN_MANAGER
from .models import RiskAlert
from .serializers import RiskAlertSerializer


class RiskAlertListView(ListAPIView):
    permission_classes = [CEO_ADMIN_MANAGER]
    queryset = RiskAlert.objects.all()
    serializer_class = RiskAlertSerializer