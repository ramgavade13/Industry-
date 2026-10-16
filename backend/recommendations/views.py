from rest_framework.generics import ListAPIView
from accounts.permissions import CEO_ADMIN
from .models import Recommendation
from .serializers import RecommendationSerializer


class RecommendationListView(ListAPIView):
    permission_classes = [CEO_ADMIN]  # SRS Section 5 would also allow managers; Section 14 says no
    queryset = Recommendation.objects.all()
    serializer_class = RecommendationSerializer