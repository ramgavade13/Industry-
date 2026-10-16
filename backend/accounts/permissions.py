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


def roles_required(*roles):
    """Build a permission class that allows only the given roles."""

    class _RolePermission(BasePermission):
        def has_permission(self, request, view):
            user = request.user
            return bool(user and user.is_authenticated and user.role in roles)

    return _RolePermission


CEO_ONLY = roles_required("ceo")
CEO_OR_MANAGER = roles_required("ceo", "manager")