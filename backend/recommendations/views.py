from rest_framework.generics import ListAPIView
from .models import Recommendation
from .serializers import RecommendationSerializer


class RecommendationListView(ListAPIView):
    queryset = Recommendation.objects.all()
    serializer_class = RecommendationSerializer