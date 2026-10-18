from django.db.models import F
from rest_framework.generics import ListAPIView
from accounts.permissions import CEO_ADMIN_MANAGER
from .models import RiskAlert
from .serializers import RiskAlertSerializer


class RiskAlertListView(ListAPIView):
    """
    Risk monitoring and alert endpoint, highest risk score first.
    Accessible to Managers, Executives (CEO), and Administrators.
    """
    permission_classes = [CEO_ADMIN_MANAGER]
    queryset = RiskAlert.objects.select_related("project_ref").order_by(F("score").desc(nulls_last=True))
    serializer_class = RiskAlertSerializer