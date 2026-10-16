from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

User = get_user_model()


def _is_admin(user):
    return user.is_authenticated and (user.role == "admin" or user.is_superuser)


def _last_login_text(dt):
    if not dt:
        return "Never"
    days = (timezone.now().date() - timezone.localtime(dt).date()).days
    if days <= 0:
        return "Today"
    if days == 1:
        return "Yesterday"
    return f"{days} days ago"


def _role_label(role):
    role = role or "employee"
    return "CEO" if role == "ceo" else role.capitalize()


class AdminUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _is_admin(request.user):
            return Response({"detail": "Admins only."}, status=403)

        users = User.objects.all().order_by("id")
        return Response([
            {
                "name": u.first_name or u.username,
                "role": _role_label(u.role),
                "status": "Active" if u.is_active else "Inactive",
                "lastLogin": _last_login_text(u.last_login),
            }
            for u in users
        ])


class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _is_admin(request.user):
            return Response({"detail": "Admins only."}, status=403)

        week_ago = timezone.now() - timedelta(days=7)
        total = User.objects.count()
        active = User.objects.filter(is_active=True).count()
        recent = User.objects.filter(last_login__gte=week_ago).count()
        privileged = User.objects.filter(role__in=["admin", "ceo"]).count()

        return Response([
            {"label": "Total Users", "value": str(total), "change": "", "trend": "up"},
            {"label": "Active Accounts", "value": str(active), "change": "", "trend": "up"},
            {"label": "Logged In (7 days)", "value": str(recent), "change": "", "trend": "up"},
            {"label": "Admins & CEOs", "value": str(privileged), "change": "", "trend": "up"},
        ])