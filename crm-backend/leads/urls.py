from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    AdminCreateDebugView,
    AdminCreateView,
    AuditLogView,
    EmailTokenObtainPairView,
    LeadDetailView,
    LeadListCreateView,
    LeadNoteCreateView,
    MeView,
    UserListView,
    UserResetPasswordView,
    UserSetActiveView,
)

urlpatterns = [
    path("auth/login/", EmailTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", MeView.as_view(), name="auth_me"),
    path("auth/create-admin/", AdminCreateView.as_view(), name="create_admin"),
    path("auth/debug/", AdminCreateDebugView.as_view(), name="auth_debug"),
    path("admin/audit/", AuditLogView.as_view(), name="audit_log"),
    path("leads/", LeadListCreateView.as_view(), name="lead_list"),
    path("leads/<int:pk>/", LeadDetailView.as_view(), name="lead_detail"),
    path("leads/<int:lead_id>/add_note/", LeadNoteCreateView.as_view(), name="lead_add_note"),
    path("admin/users/", UserListView.as_view(), name="admin_users"),
    path("admin/users/<int:user_id>/set-active/", UserSetActiveView.as_view(), name="admin_user_set_active"),
    path("admin/users/<int:user_id>/reset-password/", UserResetPasswordView.as_view(), name="admin_user_reset_password"),
]
