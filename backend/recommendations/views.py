from rest_framework.generics import ListAPIView
from accounts.permissions import CEO_ONLY
from .models import Recommendation
from .serializers import RecommendationSerializer


class RecommendationListView(ListAPIView):
    permission_classes = [CEO_ONLY]
    queryset = Recommendation.objects.all()
    serializer_class = RecommendationSerializer