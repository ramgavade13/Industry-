from django.contrib import admin
from .models import KPI, RevenueMonth
from .models import KPIValue, FinancialRecord

admin.site.register(KPI)
admin.site.register(RevenueMonth)



@admin.register(KPIValue)
class KPIValueAdmin(admin.ModelAdmin):
    list_display = ("kpi", "period", "actual")
    list_filter = ("kpi",)


@admin.register(FinancialRecord)
class FinancialRecordAdmin(admin.ModelAdmin):
    list_display = ("period", "revenue", "expenses", "project")