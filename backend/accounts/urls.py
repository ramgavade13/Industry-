from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import LoginView, LogoutView, SignupView
from .admin_views import AdminUsersView, AdminStatsView

urlpatterns = [
    path("signup/", SignupView.as_view(), name="signup"),
    path("login/", LoginView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("admin/users/", AdminUsersView.as_view(), name="admin-users"),
    path("admin/stats/", AdminStatsView.as_view(), name="admin-stats"),
]