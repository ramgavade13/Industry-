from rest_framework.permissions import BasePermission


def is_authenticated_user(request):
    return bool(request.user and request.user.is_authenticated)


def _has_role(request, role):
    return bool(
        is_authenticated_user(request) and (
            getattr(request.user, "role", None) == role or getattr(request.user, "is_superuser", False)
        )
    )


class IsCEO(BasePermission):
    """
    Allows access only to Executive (CEO) users or superusers.
    """
    message = "Executive access required: Only the CEO can access this resource."

    def has_permission(self, request, view):
        return _has_role(request, "ceo")


class IsAdmin(BasePermission):
    """
    Allows access only to System Administrators or superusers.
    """
    message = "Administrator access required: Only administrators can access this resource."

    def has_permission(self, request, view):
        return _has_role(request, "admin")


class IsManager(BasePermission):
    """
    Allows access only to Manager users or superusers.
    """
    message = "Manager access required: Only managers can access this resource."

    def has_permission(self, request, view):
        return _has_role(request, "manager")


class IsExecutiveOrAdmin(BasePermission):
    """
    Allows access exclusively to Executives (CEO) and Administrators (Admin).
    Protects confidential corporate financial insights, forecasts, and AI recommendations.
    """
    message = "Restricted access: Only Executive (CEO) and Administrator accounts can access this resource."

    def has_permission(self, request, view):
        return bool(
            is_authenticated_user(request) and (
                getattr(request.user, "role", None) in ["ceo", "admin"] or getattr(request.user, "is_superuser", False)
            )
        )


class IsManagerOrAbove(BasePermission):
    """
    Allows access to Managers, Executives (CEO), and Administrators (Admin).
    Used for team productivity, project oversight, and risk monitoring.
    """
    message = "Management access required: Available to Managers, Executives, and Administrators."

    def has_permission(self, request, view):
        return bool(
            is_authenticated_user(request) and (
                getattr(request.user, "role", None) in ["ceo", "admin", "manager"] or getattr(request.user, "is_superuser", False)
            )
        )


def HasRole(*roles):
    """
    Dynamic permission class factory for arbitrary role combinations.
    Example: permission_classes = [HasRole('ceo', 'admin')]
    """
    class _DynamicRolePermission(BasePermission):
        message = f"Role authorization required. Permitted roles: {', '.join(roles)}."

        def has_permission(self, request, view):
            return bool(
                is_authenticated_user(request) and (
                    getattr(request.user, "role", None) in roles or getattr(request.user, "is_superuser", False)
                )
            )

    return _DynamicRolePermission


roles_required = HasRole

CEO_ONLY = roles_required("ceo")
CEO_OR_MANAGER = roles_required("ceo", "manager")
CEO_ADMIN = roles_required("ceo", "admin")
CEO_ADMIN_MANAGER = roles_required("ceo", "admin", "manager")

