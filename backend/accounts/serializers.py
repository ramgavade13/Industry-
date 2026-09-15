from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class SignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "role", "first_name"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["email"],       # we'll use email as username
            email=validated_data["email"],
            password=validated_data["password"],
            role=validated_data["role"],
            first_name=validated_data.get("first_name", ""),
        )
        return user