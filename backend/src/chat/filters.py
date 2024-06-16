import django_filters

from chat.models import ChatMessage


class ChatMessageFilter(django_filters.FilterSet):
    class Meta:
        model = ChatMessage
        fields = {
            "author": ["isnull"]
        }
