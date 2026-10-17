from django.urls import path
from .views import KPIListView, RevenueTrendView, ExecutiveAnalysisView

urlpatterns = [
    path("kpis/", KPIListView.as_view(), name="kpi-list"),
    path("financials/trend/", RevenueTrendView.as_view(), name="revenue-trend"),
    path("executive-analysis/", ExecutiveAnalysisView.as_view(), name="executive-analysis-slash"),
    path("executive-analysis", ExecutiveAnalysisView.as_view(), name="executive-analysis"),
]