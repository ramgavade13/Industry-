"""
Administrator user management and the user's own profile.

  GET/POST  manage/users/        list (search, role and status filters) and create users   - admin only
  GET/PATCH manage/users/<id>/   view, edit, change role, deactivate, reset password       - admin only
  GET/PATCH me/profile/          the logged-in user's own name and email
  POST      me/password/         the logged-in user changes their own password

Safety rules: an administrator cannot remove their own admin access or deactivate
themselves, and the last active administrator can never be demoted or deactivated.
Passwords are checked by Django's password validators.
"""

from django.contrib.auth import get_user_model, password_validation
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Q
from rest_framework import serializers
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .permissions import IsAdmin

User = get_user_model()


def _check_password(value, user=None):
    try:
        password_validation.validate_password(value, user=user)
    except DjangoValidationError as exc:
        raise serializers.ValidationError(list(exc.messages))
    return value


def _active_admins():
    return User.objects.filter(is_active=True).filter(Q(role="admin") | Q(is_superuser=True))


def _email_taken(value, exclude_pk=None):
    clash = User.objects.filter(email__iexact=value)
    if exclude_pk:
        clash = clash.exclude(pk=exclude_pk)
    return clash.exists()


class UserReadSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name", "name",
            "role", "is_active", "last_login", "date_joined",
        ]

    def get_name(self, obj):
        return obj.get_full_name().strip() or obj.username


class UserCreateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    class Meta:
        model = User
        fields = ["username", "email", "first_name", "last_name", "role", "password"]
        extra_kwargs = {"first_name": {"required": True, "allow_blank": False}}

    def validate_username(self, value):
        value = value.strip()
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_email(self, value):
        value = value.strip().lower()
        if _email_taken(value):
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_password(self, value):
        return _check_password(value)

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

    def to_representation(self, instance):
        return UserReadSerializer(instance, context=self.context).data


class UserUpdateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["email", "first_name", "last_name", "role", "is_active", "password"]

    def validate_email(self, value):
        value = value.strip().lower()
        if _email_taken(value, exclude_pk=self.instance.pk):
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_password(self, value):
        return _check_password(value, user=self.instance) if value else value

    def validate(self, attrs):
        target = self.instance
        actor = self.context["request"].user
        new_role = attrs.get("role", target.role)
        new_active = attrs.get("is_active", target.is_active)

        was_admin = target.is_active and (target.role == "admin" or target.is_superuser)
        stays_admin = new_active and (new_role == "admin" or target.is_superuser)
        if was_admin and not stays_admin:
            if target.pk == actor.pk:
                raise serializers.ValidationError(
                    "You cannot remove your own admin access or deactivate your own account."
                )
            if not _active_admins().exclude(pk=target.pk).exists():
                raise serializers.ValidationError("At least one active administrator must remain.")
        return attrs

    def update(self, instance, validated_data):
        password = validated_data.pop("password", "")
        instance = super().update(instance, validated_data)
        if password:
            instance.set_password(password)
            instance.save(update_fields=["password"])
        return instance

    def to_representation(self, instance):
        return UserReadSerializer(instance, context=self.context).data


class ManageUserListView(ListCreateAPIView):
    """
    GET  - all users. Optional filters: ?q=<name, username or email>, ?role=, ?status=active|inactive
    POST - create a user with any role (administrators only).
    """
    permission_classes = [IsAdmin]

    def get_serializer_class(self):
        return UserCreateSerializer if self.request.method == "POST" else UserReadSerializer

    def get_queryset(self):
        qs = User.objects.all()
        q = self.request.query_params.get("q", "").strip()
        if q:
            qs = qs.filter(
                Q(username__icontains=q) | Q(email__icontains=q)
                | Q(first_name__icontains=q) | Q(last_name__icontains=q)
            )
        role = self.request.query_params.get("role", "").strip()
        if role:
            qs = qs.filter(role=role)
        state = self.request.query_params.get("status", "").strip()
        if state == "active":
            qs = qs.filter(is_active=True)
        elif state == "inactive":
            qs = qs.filter(is_active=False)
        return qs.order_by("first_name", "username")


class ManageUserDetailView(RetrieveUpdateAPIView):
    permission_classes = [IsAdmin]
    queryset = User.objects.all()

    def get_serializer_class(self):
        return UserReadSerializer if self.request.method == "GET" else UserUpdateSerializer


class ProfileUpdateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()

    class Meta:
        model = User
        fields = ["first_name", "last_name", "email"]

    def validate_email(self, value):
        value = value.strip().lower()
        if _email_taken(value, exclude_pk=self.instance.pk):
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def to_representation(self, instance):
        return UserReadSerializer(instance, context=self.context).data


class ProfileView(APIView):
    """The logged-in user's own profile (any role)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserReadSerializer(request.user).data)

    def patch(self, request):
        serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate_current_password(self, value):
        if not self.context["request"].user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "The two new passwords do not match."})
        if attrs["new_password"] == attrs["current_password"]:
            raise serializers.ValidationError({"new_password": "The new password must be different from the current one."})
        try:
            _check_password(attrs["new_password"], user=self.context["request"].user)
        except serializers.ValidationError as exc:
            raise serializers.ValidationError({"new_password": exc.detail})
        return attrs


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])
        return Response({"message": "Password changed."})