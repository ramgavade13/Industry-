from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsManagerOrAbove
from .models import RiskAlert
from .serializers import RiskAlertSerializer


class RiskAlertListView(ListAPIView):
    """
    Risk monitoring and alert endpoint.
    Accessible to Managers, Executives (CEO), and Administrators.
    """
    permission_classes = [IsAuthenticated, IsManagerOrAbove]
    queryset = RiskAlert.objects.all()
    serializer_class = RiskAlertSerializer