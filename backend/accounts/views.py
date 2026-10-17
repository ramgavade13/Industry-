from django.contrib.auth import get_user_model
from django.contrib.auth.models import update_last_login
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .permissions import IsAdmin
from .serializers import (
    CustomTokenObtainPairSerializer,
    SignupSerializer,
    UserRoleUpdateSerializer,
    UserSerializer,
)

User = get_user_model()


class SignupView(APIView):
    """
    Public registration endpoint.
    All self-registered users are assigned the 'employee' role.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    "message": "Account created successfully.",
                    "user": {
                        "id": user.id,
                        "email": user.email,
                        "username": user.username,
                        "role": user.role,
                        "name": user.first_name or user.username,
                    },
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(TokenObtainPairView):
    """
    JWT authentication endpoint.
    Accepts either 'email' or 'username' alongside 'password'.
    Returns signed access and refresh JWT tokens containing user role claims.
    """
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                update_last_login(None, serializer.user)
        return response


class LogoutView(APIView):
    """
    Logout endpoint that invalidates and blacklists the refresh JWT token.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"detail": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"message": "Logged out successfully. Token blacklisted."},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"detail": f"Invalid or expired refresh token: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class CurrentUserView(APIView):
    """
    Returns authenticated user profile, permissions, and executive/admin flags.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response({
            "user": serializer.data,
            "role": user.role,
            "is_executive": user.role in ["ceo", "admin"] or user.is_superuser,
            "is_admin": user.role == "admin" or user.is_superuser,
            "is_manager": user.role in ["ceo", "admin", "manager"] or user.is_superuser,
        })


class RolesListView(APIView):
    """
    Returns available system roles for user assignment and dropdowns.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        roles = [{"value": code, "label": label} for code, label in User.ROLE_CHOICES]
        return Response({"roles": roles})


class AdminUserListView(ListAPIView):
    """
    Administrator endpoint: List all users in the system.
    Restricted strictly to administrators (IsAdmin).
    """
    permission_classes = [IsAdmin]
    queryset = User.objects.all().order_by("id")
    serializer_class = UserSerializer


class AdminUserRoleUpdateView(APIView):
    """
    Administrator endpoint: Update a user's assigned role.
    Restricted strictly to administrators (IsAdmin).
    """
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        target_user = get_object_or_404(User, pk=pk)
        serializer = UserRoleUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        new_role = serializer.validated_data["role"]

        # Prevent an admin from accidentally locking themselves out
        if target_user == request.user and new_role != "admin" and not request.user.is_superuser:
            return Response(
                {"detail": "Administrators cannot remove their own admin role."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        target_user.role = new_role
        target_user.save(update_fields=["role"])

        return Response({
            "message": f"Role for '{target_user.username}' successfully updated to '{new_role}'.",
            "user": UserSerializer(target_user).data,
        })

