from django.contrib import admin
from .models import Message, Ticket

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'recipient', 'subject', 'timestamp', 'is_read')
    search_fields = ('subject', 'body')
    list_filter = ('is_read', 'timestamp')

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('customer', 'agent', 'subject', 'status', 'created_at')
    search_fields = ('subject', 'description')
    list_filter = ('status', 'created_at')