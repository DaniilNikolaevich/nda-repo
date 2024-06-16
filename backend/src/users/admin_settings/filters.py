import django_filters

from users.models import User


class UserFilter(django_filters.FilterSet):
    class Meta:
        model = User
        fields = {
            "role": ['exact'],
            "is_active": ['exact'],
            "is_registered": ['exact'],
        }
