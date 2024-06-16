import datetime
import logging

import django_filters

from users.models import UserInformation

logger = logging.getLogger(__name__)


class UserInformationFilter(django_filters.FilterSet):
    date_range = django_filters.CharFilter(
        field_name='updated_at',
        method='filter_by_date_range'
    )

    preferred_work_schedule = django_filters.CharFilter(
        method='filter_by_array_field'
    )

    preferred_employment_type = django_filters.CharFilter(
        method='filter_by_array_field'
    )

    class Meta:
        model = UserInformation
        fields = {
            "preferred_salary": ["isnull", "gte"],
            "city": ["in"],
            "preferred_position": ["in"],
            "business_trip": ["exact"],
            "relocation": ["exact"]
        }

    def filter_by_date_range(self, queryset, name, value):
        today = datetime.datetime.today()
        logger.info(value)

        if value == 'last_day':
            queryset = queryset.filter(
                updated_at__gte=today - datetime.timedelta(days=1)
            )
        elif value == 'last_week':
            queryset = queryset.filter(
                updated_at__gte=today - datetime.timedelta(weeks=1)
            )
        elif value == 'last_month':
            queryset = queryset.filter(
                updated_at__gte=today - datetime.timedelta(weeks=4)
            )
        return queryset

    def filter_by_array_field(self, queryset, name, value):
        # Expecting a comma-separated list of integers as the value
        values = value.split(',')
        # Convert values to integer if they are numeric
        values = [int(val) for val in values if val.isdigit()]
        if values:
            # The '__contains' lookup can be used with ArrayField to check if it contains any of the values
            return queryset.filter(**{f"{name}__contains": values})
        return queryset
