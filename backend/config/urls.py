from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def root_health_view(request):
    """
    Health check and index endpoint for the root URL '/'.
    """
    return JsonResponse({
        "status": "online",
        "service": "AI Executive Decision Agent Backend API",
        "version": "1.0.0",
        "endpoints": {
            "auth_login": "/api/accounts/login/",
            "auth_signup": "/api/accounts/signup/",
            "auth_token_refresh": "/api/accounts/token/refresh/",
            "auth_me": "/api/accounts/me/",
            "financials_trend": "/api/financials/trend/",
            "kpis": "/api/kpis/",
            "forecasting": "/api/forecast/revenue/",
            "recommendations": "/api/recommendations/",
            "reports": "/api/reports/<type>/",
            "chat": "/api/chat/",
            "voice": "/api/voice/",
            "admin": "/admin/",
        },
    })


urlpatterns = [
    path("", root_health_view, name="api_root"),
    path("admin/", admin.site.urls),
    path("api/accounts/", include("accounts.urls")),
    path("api/auth/", include("accounts.urls")),
    path("api/", include("finance.urls")),
    path("api/", include("risk.urls")),
    path("api/", include("productivity.urls")),
    path("api/forecast/", include("forecasting.urls")),
    path("api/recommendations/", include("recommendations.urls")),
    path("api/chat/", include("chat.urls")),
    path("api/reports/", include("reports.urls")),
    path("api/voice/", include("voice.urls")),
]