import logging

from django.conf import settings
from django.contrib.admin.models import LogEntry
from django.contrib.auth.signals import user_login_failed
from django.core.mail import send_mail
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Lead


audit_logger = logging.getLogger("crm.audit")


@receiver(post_save, sender=Lead)
def notify_admin_on_new_lead(sender, instance: Lead, created: bool, **kwargs) -> None:
    if not created:
        return

    if not settings.EMAIL_HOST_USER:
        return

    subject = f"New lead from {instance.source}"
    message = (
        f"Name: {instance.name}\n"
        f"Email: {instance.email}\n"
        f"Message:\n{instance.message}\n"
    )

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[settings.EMAIL_HOST_USER],
        fail_silently=False,
    )


@receiver(user_login_failed)
def log_failed_login(sender, credentials, request, **kwargs) -> None:
    username = credentials.get("username") or credentials.get("email")
    ip_address = None
    if request:
        ip_address = request.META.get("REMOTE_ADDR")
    audit_logger.info("login_failed user=%s ip=%s", username, ip_address)


@receiver(post_save, sender=LogEntry)
def log_admin_action(sender, instance: LogEntry, created: bool, **kwargs) -> None:
    if not created:
        return
    audit_logger.info(
        "admin_action user_id=%s content_type=%s object_id=%s action_flag=%s message=%s",
        instance.user_id,
        instance.content_type_id,
        instance.object_id,
        instance.action_flag,
        instance.change_message,
    )
