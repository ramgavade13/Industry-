from django.db import models


class RiskAlert(models.Model):
    project = models.CharField(max_length=150)
    risk = models.CharField(max_length=200)
    severity = models.CharField(
        max_length=6,
        choices=[("high", "high"), ("medium", "medium"), ("low", "low")],
    )
    # new, all optional
    project_ref = models.ForeignKey(
        "productivity.Project", on_delete=models.SET_NULL,
        null=True, blank=True, related_name="risk_alerts",
    )
    score = models.FloatField(null=True, blank=True, help_text="Risk score, 0 to 100")
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        return self.project