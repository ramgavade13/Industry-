from django.conf import settings
from django.db import models
from django.utils import timezone


class Recommendation(models.Model):
    title = models.CharField(max_length=200)
    problem = models.TextField()
    evidence = models.TextField()
    action = models.TextField()
    impact = models.TextField()
    confidence = models.CharField(
        max_length=10,
        choices=[("High", "High"), ("Medium", "Medium"), ("Low", "Low")],
    )

    def __str__(self):
        return self.title


class RecommendationDecision(models.Model):
    """
    The CEO's / Admin's decision on a recommendation.

    It is stored by recommendation TITLE (not by row id), so when the AI runs again
    and re-creates the recommendations, a decision already made on the same
    recommendation is kept. "New" means there is no row here.
    """
    STATUS_CHOICES = [("Accepted", "Accepted"), ("Dismissed", "Dismissed")]

    title = models.CharField(max_length=200, unique=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    decided_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="+",
    )
    decided_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.title}: {self.status}"