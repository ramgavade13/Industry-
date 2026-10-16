from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsExecutiveOrAdmin
from .models import Recommendation
from .serializers import RecommendationSerializer


class RecommendationListView(ListAPIView):
    """
    AI Recommendations endpoint.
    Secured strictly for Executive (CEO) and Administrator access.
    """
    permission_classes = [IsAuthenticated, IsExecutiveOrAdmin]
    queryset = Recommendation.objects.all()
    serializer_class = RecommendationSerializer