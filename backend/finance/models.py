from django.db import models

class KPI(models.Model):
    label = models.CharField(max_length=100)
    value = models.CharField(max_length=50)
    change = models.CharField(max_length=20)
    trend = models.CharField(max_length=4, choices=[("up", "up"), ("down", "down")])

    def __str__(self):
        return self.label


class RevenueMonth(models.Model):
    month = models.CharField(max_length=10)
    revenue = models.FloatField()
    expenses = models.FloatField()

    def __str__(self):
        return self.month