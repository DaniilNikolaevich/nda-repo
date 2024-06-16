import django_filters

from base.models import User


class UserFilter(django_filters.FilterSet):
    class Meta:
        model = User
        fields = {
            'is_active': ['exact']
        }
