from django.urls import path
from .views import ReportDownloadView

urlpatterns = [
    path("<str:report_type>/", ReportDownloadView.as_view(), name="report-download"),
]