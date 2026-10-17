from rest_framework.generics import ListAPIView
from accounts.permissions import CEO_ADMIN
from .models import Recommendation
from .serializers import RecommendationSerializer


class RecommendationListView(ListAPIView):
    """
    AI Recommendations endpoint.
    Secured strictly for Executive (CEO) and Administrator access.
    """
    permission_classes = [CEO_ADMIN]
    queryset = Recommendation.objects.all()
    serializer_class = RecommendationSerializer