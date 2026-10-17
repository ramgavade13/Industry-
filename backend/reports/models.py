from django.conf import settings
from django.db import models


class Report(models.Model):
    TYPE_CHOICES = [
        ("executive", "Executive"),
        ("kpi", "KPI"),
        ("financial", "Financial"),
        ("risk", "Risk"),
    ]
    report_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    generated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="reports",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title