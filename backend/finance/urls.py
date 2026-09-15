from django.urls import path
from .views import KPIListView, RevenueTrendView

urlpatterns = [
    path("kpis/", KPIListView.as_view(), name="kpi-list"),
    path("financials/trend/", RevenueTrendView.as_view(), name="revenue-trend"),
]