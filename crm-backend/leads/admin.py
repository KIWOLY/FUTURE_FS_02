from django.contrib import admin

from .models import Lead, Note


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
	list_display = ("name", "email", "source", "status", "created_at")
	list_filter = ("status", "source", "created_at")
	search_fields = ("name", "email", "message")
	ordering = ("-created_at",)


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
	list_display = ("lead", "text", "created_at")
	search_fields = ("text",)
	ordering = ("-created_at",)
