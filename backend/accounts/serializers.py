from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT token serializer that embeds role, email, and user details in the token payload.
    Supports login with either email or username.
    """
    email = serializers.CharField(required=False, write_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.username_field in self.fields:
            self.fields[self.username_field].required = False

    def validate(self, attrs):
        # Support login with either email or username
        login_id = (
            attrs.get(self.username_field)
            or self.initial_data.get("email")
            or self.initial_data.get("username")
        )

        if not login_id:
            raise serializers.ValidationError({
                "detail": "Email or username is required."
            })

        login_id = str(login_id).strip()
        # If user entered an email address or username, lookup the exact username
        user_by_email = User.objects.filter(email__iexact=login_id).first()
        if user_by_email:
            attrs[self.username_field] = user_by_email.get_username()
        else:
            attrs[self.username_field] = login_id

        data = super().validate(attrs)

        # Response payload includes JWT tokens and profile metadata
        data["token"] = data["access"]  # Compatibility with frontend expecting 'token'
        data["role"] = self.user.role
        data["name"] = self.user.first_name or self.user.username
        data["email"] = self.user.email
        data["user_id"] = self.user.id

        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Custom claims embedded inside the signed JWT access/refresh token
        token["user_id"] = user.id
        token["username"] = user.username
        token["email"] = user.email
        token["role"] = user.role
        token["name"] = user.first_name or user.username
        token["is_staff"] = user.is_staff
        token["is_superuser"] = user.is_superuser

        return token


class SignupSerializer(serializers.ModelSerializer):
    """
    Serializer for public account registration.
    Prevents role escalation: all public registrations are assigned the 'employee' role.
    Elevated roles (manager, admin, ceo) must be provisioned by an administrator.
    """

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "role", "first_name", "last_name"]
        read_only_fields = ["role"]
        extra_kwargs = {
            "password": {"write_only": True},
            "username": {"required": False},
        }

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email is required.")
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def create(self, validated_data):
        email = validated_data.get("email", "").lower()
        username = validated_data.get("username") or email

        # Ensure unique username if fallback email was used
        if User.objects.filter(username=username).exists():
            username = email

        # Enforce employee role to prevent role escalation
        user = User.objects.create_user(
            username=username,
            email=email,
            password=validated_data["password"],
            role="employee",
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    """
    Full user profile representation for current user profile and admin management.
    """

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "role",
            "first_name",
            "last_name",
            "is_active",
            "is_staff",
            "date_joined",
        ]
        read_only_fields = ["id", "is_staff", "date_joined"]


class UserRoleUpdateSerializer(serializers.Serializer):
    """
    Serializer used by administrators to modify another user's assigned role.
    """
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES)

