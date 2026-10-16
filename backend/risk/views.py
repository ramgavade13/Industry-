from rest_framework.generics import ListAPIView
from accounts.permissions import CEO_ONLY
from .models import RiskAlert
from .serializers import RiskAlertSerializer


class RiskAlertListView(ListAPIView):
    permission_classes = [CEO_ONLY]
    queryset = RiskAlert.objects.all()
    serializer_class = RiskAlertSerializer