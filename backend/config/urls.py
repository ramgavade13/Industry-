from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

from finance.kpis import KPIListView
from productivity.team_api import TeamListView


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
            "auth_profile": "/api/accounts/me/profile/",
            "financials_trend": "/api/financials/trend/",
            "kpis": "/api/kpis/",
            "risks": "/api/risks/",
            "projects": "/api/projects/",
            "tasks": "/api/tasks/",
            "teams": "/api/teams/",
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
    path("api/kpis/", KPIListView.as_view(), name="kpis"),
    path("api/teams/", TeamListView.as_view(), name="teams"),
    path("api/tasks/", include("productivity.task_urls")),
    path("api/projects/", include("productivity.project_urls")),
    path("api/", include("finance.urls")),
    path("api/", include("risk.urls")),
    path("api/", include("productivity.urls")),
    path("api/forecast/", include("forecasting.urls")),
    path("api/recommendations/", include("recommendations.urls")),
    path("api/chat/", include("chat.urls")),
    path("api/reports/", include("reports.urls")),
    path("api/voice/", include("voice.urls")),
]