from django.conf import settings
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Lead, Note
from .serializers import (
    AdminCreateSerializer,
    EmailTokenObtainPairSerializer,
    LeadCreateSerializer,
    LeadDetailSerializer,
    LeadSerializer,
    LeadStatusSerializer,
    NoteCreateSerializer,
    NoteSerializer,
    UserPasswordResetSerializer,
    UserSerializer,
    UserUpdateSerializer,
)


class LeadListCreateView(generics.ListCreateAPIView):
    queryset = Lead.objects.all().order_by("-created_at")

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return LeadCreateSerializer
        return LeadSerializer


class LeadDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Lead.objects.all().order_by("-created_at")
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "patch", "delete"]

    def get_serializer_class(self):
        if self.request.method == "PATCH":
            return LeadStatusSerializer
        return LeadDetailSerializer

    def patch(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return self.update(request, *args, **kwargs)


class LeadNoteCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, lead_id):
        lead = get_object_or_404(Lead, id=lead_id)
        serializer = NoteCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        note = Note.objects.create(lead=lead, **serializer.validated_data)
        return Response(NoteSerializer(note).data, status=status.HTTP_201_CREATED)


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class AdminCreateView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        if not request.user.is_superuser:
            return Response({"detail": "Superuser required."}, status=status.HTTP_403_FORBIDDEN)

        serializer = AdminCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "id": user.id,
                "email": user.email,
                "username": user.get_username(),
                "first_name": user.first_name,
                "last_name": user.last_name,
            },
            status=status.HTTP_201_CREATED,
        )


class AdminCreateDebugView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(
            {
                "id": request.user.id,
                "email": request.user.email,
                "username": request.user.get_username(),
                "first_name": request.user.first_name,
                "last_name": request.user.last_name,
                "is_staff": request.user.is_staff,
                "is_superuser": request.user.is_superuser,
            }
        )


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return get_user_model().objects.all().order_by("-date_joined")


class UserSetActiveView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, user_id):
        if not request.user.is_superuser:
            return Response({"detail": "Superuser required."}, status=status.HTTP_403_FORBIDDEN)

        user = get_object_or_404(get_user_model(), id=user_id)
        if user.id == request.user.id:
            return Response({"detail": "You cannot disable your own account."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user.is_active = serializer.validated_data["is_active"]
        user.save(update_fields=["is_active"])
        return Response(UserSerializer(user).data)


class UserResetPasswordView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, user_id):
        if not request.user.is_superuser:
            return Response({"detail": "Superuser required."}, status=status.HTTP_403_FORBIDDEN)

        user = get_object_or_404(get_user_model(), id=user_id)
        serializer = UserPasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user.set_password(serializer.validated_data["password"])
        user.save(update_fields=["password"])
        return Response({"detail": "Password updated."})


class AuditLogView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        limit = int(request.query_params.get("limit", 50))
        offset = int(request.query_params.get("offset", 0))
        log_path = settings.BASE_DIR / "logs" / "crm.log"
        entries = []
        if log_path.exists():
            with log_path.open("r", encoding="utf-8") as log_file:
                lines = [line.strip() for line in log_file.readlines() if line.strip()]
                total = len(lines)
                start = max(total - offset - limit, 0)
                end = total - offset
                entries = lines[start:end]

        formatted = []
        for entry in entries:
            parts = entry.split(" ", 4)
            if len(parts) == 5:
                level, date_part, time_part, name, message = parts
                timestamp = f"{date_part} {time_part}"
            else:
                level, timestamp, name, message = "INFO", "", "crm.audit", entry
            formatted.append({
                "raw": entry,
                "level": level,
                "timestamp": timestamp,
                "name": name,
                "message": message,
            })

        return Response({
            "entries": formatted,
            "limit": limit,
            "offset": offset,
        })
