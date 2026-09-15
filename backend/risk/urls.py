from django.urls import path
from .views import RiskAlertListView

urlpatterns = [
    path("risks/", RiskAlertListView.as_view(), name="risk-list"),
]