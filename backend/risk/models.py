from django.db import models

class RiskAlert(models.Model):
    project = models.CharField(max_length=150)
    risk = models.CharField(max_length=200)
    severity = models.CharField(max_length=6, choices=[("high", "high"), ("medium", "medium"), ("low", "low")])

    def __str__(self):
        return self.project