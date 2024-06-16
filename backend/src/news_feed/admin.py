from django.contrib import admin

from news_feed.models import News, NewsDocument, NewsLike, NewsTag, SubscriptionEmail


@admin.register(NewsTag)
class NewsTagAdmin(admin.ModelAdmin):
    pass


@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    pass


@admin.register(NewsDocument)
class NewsDocumentAdmin(admin.ModelAdmin):
    pass


@admin.register(NewsLike)
class NewsLikeAdmin(admin.ModelAdmin):
    pass


@admin.register(SubscriptionEmail)
class SubscriptionEmailAdmin(admin.ModelAdmin):
    list_display = ('id', 'email', 'is_active', 'subscription_type')
    list_display_links = ('id', 'email')
    list_filter = ('is_active', 'subscription_type')
    search_fields = ('email',)
    ordering = ['-is_active', 'email']
    fieldsets = (
        (None, {
            'fields': ('email', 'is_active', 'subscription_type')
        }),
        ('Информация о подписке', {
            'fields': ('id',),
            'classes': ('collapse',),  # Скрытие поля id в collapsible section
        }),
    )
    readonly_fields = ('id',)
    list_editable = ('is_active', 'subscription_type')
