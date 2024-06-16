from django.contrib import admin

from chat.models import Chat, ChatMessage


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'candidate', 'recruiter')
    search_fields = ('name', 'candidate__username', 'recruiter__username')
    list_filter = ('candidate', 'recruiter')
    raw_id_fields = ('candidate', 'recruiter')
    ordering = ('-created_at',)


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'chat', 'author', 'message')
    search_fields = ('chat__name', 'author__username', 'message')
    list_filter = ('chat', 'author')
    raw_id_fields = ('chat', 'author')
    ordering = ('-created_at',)
