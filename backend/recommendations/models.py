from django.db import models


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