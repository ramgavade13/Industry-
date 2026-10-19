from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import serializers
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import CEO_ADMIN
from .models import Recommendation, RecommendationDecision
from .serializers import RecommendationSerializer


def _decisions():
    """title -> decision, for the serializer."""
    return {d.title: d for d in RecommendationDecision.objects.select_related("decided_by")}


class RecommendationListView(ListAPIView):
    """
    AI Recommendations endpoint, with the decision (New / Accepted / Dismissed) on each.
    Secured strictly for Executive (CEO) and Administrator access.
    """
    permission_classes = [CEO_ADMIN]
    queryset = Recommendation.objects.all()
    serializer_class = RecommendationSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["decisions"] = _decisions()
        return context


class DecisionInputSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=["New", "Accepted", "Dismissed"])


class RecommendationDecisionView(APIView):
    """
    PATCH /api/recommendations/<id>/  with {"status": "Accepted" | "Dismissed" | "New"}
    "New" undoes an earlier decision. Executives and Administrators only.
    """
    permission_classes = [CEO_ADMIN]

    def patch(self, request, pk):
        recommendation = get_object_or_404(Recommendation, pk=pk)
        data = DecisionInputSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        status = data.validated_data["status"]

        if status == "New":
            RecommendationDecision.objects.filter(title=recommendation.title).delete()
        else:
            RecommendationDecision.objects.update_or_create(
                title=recommendation.title,
                defaults={"status": status, "decided_by": request.user, "decided_at": timezone.now()},
            )

        serializer = RecommendationSerializer(recommendation, context={"decisions": _decisions()})
        return Response(serializer.data)