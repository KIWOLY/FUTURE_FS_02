import logging

from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import AuthenticationFailed

from .models import Lead, Note


audit_logger = logging.getLogger("crm.audit")


class LeadCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = ["id", "name", "email", "message", "source", "status", "created_at"]
        read_only_fields = ["id", "status", "created_at"]


class LeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = ["id", "name", "email", "message", "source", "status", "created_at"]


class LeadStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = ["status"]


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "text", "created_at"]


class NoteCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["text"]


class LeadDetailSerializer(serializers.ModelSerializer):
    notes = NoteSerializer(many=True, read_only=True)

    class Meta:
        model = Lead
        fields = ["id", "name", "email", "message", "source", "status", "created_at", "notes"]


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["email"] = serializers.EmailField()
        self.fields.pop(self.username_field, None)

    def validate(self, attrs):
        user_model = get_user_model()
        try:
            user = user_model.objects.get(email__iexact=attrs["email"])
        except user_model.DoesNotExist:
            request = self.context.get("request")
            ip_address = request.META.get("REMOTE_ADDR") if request else None
            audit_logger.info("login_failed user=%s ip=%s", attrs.get("email"), ip_address)
            raise AuthenticationFailed("No active account found with the given credentials")

        if not user.is_active:
            request = self.context.get("request")
            ip_address = request.META.get("REMOTE_ADDR") if request else None
            audit_logger.info("login_failed user=%s ip=%s", user.email, ip_address)
            raise AuthenticationFailed("No active account found with the given credentials")

        data = super().validate({
            self.username_field: user.get_username(),
            "password": attrs["password"],
        })
        request = self.context.get("request")
        ip_address = request.META.get("REMOTE_ADDR") if request else None
        audit_logger.info("login_success user=%s ip=%s", user.email, ip_address)
        data["user"] = {
            "id": user.id,
            "email": user.email,
            "username": user.get_username(),
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
        }
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "is_active",
            "is_staff",
            "is_superuser",
            "last_login",
            "date_joined",
        ]


class UserUpdateSerializer(serializers.Serializer):
    is_active = serializers.BooleanField()


class UserPasswordResetSerializer(serializers.Serializer):
    password = serializers.CharField(
        min_length=8,
        write_only=True,
        error_messages={"min_length": "Password must be at least 8 characters."},
    )


class AdminCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    username = serializers.CharField(max_length=150)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    password = serializers.CharField(min_length=8, write_only=True)

    def validate_email(self, value):
        user_model = get_user_model()
        if user_model.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value

    def validate_username(self, value):
        user_model = get_user_model()
        if user_model.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def create(self, validated_data):
        user_model = get_user_model()
        user = user_model.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        user.first_name = validated_data["first_name"]
        user.last_name = validated_data["last_name"]
        user.is_staff = True
        user.is_superuser = False
        user.save(update_fields=["first_name", "last_name", "is_staff", "is_superuser"])
        return user
