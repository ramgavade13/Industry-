from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

from .admin_views import AdminStatsView, AdminUsersView
from .manage_api import (
    ChangePasswordView,
    ManageUserDetailView,
    ManageUserListView,
    ProfileView,
)
from .views import (
    AdminUserListView,
    AdminUserRoleUpdateView,
    CurrentUserView,
    LoginView,
    LogoutView,
    RolesListView,
    SignupView,
)

urlpatterns = [
    # Authentication endpoints
    path("signup/", SignupView.as_view(), name="signup"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    path("me/", CurrentUserView.as_view(), name="current_user"),
    path("me/profile/", ProfileView.as_view(), name="my_profile"),
    path("me/password/", ChangePasswordView.as_view(), name="change_password"),
    path("roles/", RolesListView.as_view(), name="roles_list"),

    # Administrator user management (REST API)
    path("users/", AdminUserListView.as_view(), name="admin_users_list"),
    path("users/<int:pk>/role/", AdminUserRoleUpdateView.as_view(), name="admin_user_role_update"),
    path("manage/users/", ManageUserListView.as_view(), name="manage_users"),
    path("manage/users/<int:pk>/", ManageUserDetailView.as_view(), name="manage_user_detail"),

    # Admin dashboard specific views
    path("admin/users/", AdminUsersView.as_view(), name="admin-users"),
    path("admin/stats/", AdminStatsView.as_view(), name="admin-stats"),
]