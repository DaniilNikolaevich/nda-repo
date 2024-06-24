from django.urls import path

from chat.views import ChatListView, ChatView, DefaultMessagesView, NotificationStat, StartChatView

urlpatterns = [
    path('', StartChatView.as_view()),
    path('users/<uuid:candidate_id>', StartChatView.as_view()),
    path('<uuid:chat_id>', ChatView.as_view(), name='chat_view'),
    path('my', ChatListView.as_view(), name='chat_list'),
    path('admin/default-messages', DefaultMessagesView.as_view(), name='default_messages'),
    path('notification-stats', NotificationStat.as_view(), name='notification_stat'),

]
