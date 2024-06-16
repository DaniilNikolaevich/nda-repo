import django_filters
from django.db.models import Q

from news_feed.models import News

class NewsFilter(django_filters.FilterSet):

    def __init__(self, *args, user=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = user

    class Meta:
        model = News
        fields = {
            'tags': ['exact'],
            'is_external': ['exact'],
            'is_active': ['exact'],
            'creator': ['exact'],
        }
