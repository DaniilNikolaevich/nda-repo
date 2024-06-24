from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.urls import include, path

from settings.views import BotAccessView, MeetingLinkView

urlpatterns = [
    path('api/admin/', admin.site.urls),
    path('api/v1/', include([
        path('users/', include('users.urls')),
        path('base/', include('base.urls')),
        path('vacancies/', include('vacancies.urls')),
        path('news/', include('news_feed.urls')),
        path('telegram-HvaAw5pS', BotAccessView.as_view()),
        path('meeting-link', MeetingLinkView.as_view()),
        path('chat/', include('chat.urls')),
        path('calendars/', include('calendars.urls')),
        path('dashboard/', include('dashboard.urls'))
    ])),
]

urlpatterns += staticfiles_urlpatterns()
