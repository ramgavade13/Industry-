from rest_framework.permissions import BasePermission


def _has_role(request, role):
    return bool(request.user and request.user.is_authenticated and request.user.role == role)


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return _has_role(request, "admin")


class IsManager(BasePermission):
    def has_permission(self, request, view):
        return _has_role(request, "manager")


class IsCEO(BasePermission):
    def has_permission(self, request, view):
        return _has_role(request, "ceo")