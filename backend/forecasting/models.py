from django.db import models


class Forecast(models.Model):
    month = models.CharField(max_length=10)
    actual = models.FloatField(null=True, blank=True)
    forecast = models.FloatField()

    def __str__(self):
        return self.month


class ForecastNote(models.Model):
    title = models.CharField(max_length=200)
    detail = models.TextField()

    def __str__(self):
        return self.title