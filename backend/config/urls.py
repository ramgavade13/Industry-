from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/accounts/", include("accounts.urls")),
    path("api/", include("finance.urls")),
    path("api/", include("risk.urls")),
    path("api/", include("productivity.urls")),
    path("api/forecast/", include("forecasting.urls")),
    path("api/recommendations/", include("recommendations.urls")),
    path("api/chat/", include("chat.urls")),
    path("api/reports/", include("reports.urls")),
    path("api/voice/", include("voice.urls")),
]