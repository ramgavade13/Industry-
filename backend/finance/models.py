from django.db import models


class KPI(models.Model):
    label = models.CharField(max_length=100)
    value = models.CharField(max_length=50)
    change = models.CharField(max_length=20)
    trend = models.CharField(max_length=4, choices=[("up", "up"), ("down", "down")])
    # new, all optional
    unit = models.CharField(max_length=20, blank=True)
    target = models.FloatField(null=True, blank=True)
    threshold = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.label


class KPIValue(models.Model):
    kpi = models.ForeignKey(KPI, on_delete=models.CASCADE, related_name="history")
    period = models.DateField()
    actual = models.FloatField()

    class Meta:
        ordering = ["period"]
        constraints = [
            models.UniqueConstraint(fields=["kpi", "period"], name="unique_kpi_period"),
        ]

    def __str__(self):
        return f"{self.kpi.label} {self.period}"


class RevenueMonth(models.Model):
    month = models.CharField(max_length=10)
    revenue = models.FloatField()
    expenses = models.FloatField()

    def __str__(self):
        return self.month


class FinancialRecord(models.Model):
    period = models.DateField()
    revenue = models.DecimalField(max_digits=14, decimal_places=2)
    expenses = models.DecimalField(max_digits=14, decimal_places=2)
    # empty project = company-wide record
    project = models.ForeignKey(
        "productivity.Project", on_delete=models.SET_NULL,
        null=True, blank=True, related_name="financial_records",
    )

    class Meta:
        ordering = ["period"]

    def __str__(self):
        return f"{self.period} ({self.project or 'company'})"