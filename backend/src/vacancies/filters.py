import datetime
import logging

import django_filters

from vacancies.models import Vacancy, RecruiterFlow

logger = logging.getLogger(__name__)


class VacancyFilter(django_filters.FilterSet):
    date_range = django_filters.CharFilter(
        field_name='created_at',
        method='filter_by_date_range'
    )

    class Meta:
        model = Vacancy
        fields = {
            "status": ["exact", "in"],
            "category": ["exact", "in"],
            "salary": ["isnull", "gte"],
            "city": ["in"],
            "work_schedule": ["in"],
            "employment_type": ["in"]
        }

    def filter_by_date_range(self, queryset, name, value):
        today = datetime.datetime.today()
        logger.info(value)

        if value == 'last_day':
            queryset = queryset.filter(
                created_at__gte=today - datetime.timedelta(days=1)
            )
        elif value == 'last_week':
            queryset = queryset.filter(
                created_at__gte=today - datetime.timedelta(weeks=1)
            )
        elif value == 'last_month':
            queryset = queryset.filter(
                created_at__gte=today - datetime.timedelta(weeks=4)
            )
        return queryset


class RecruiterFlowFilter(django_filters.FilterSet):
    class Meta:
        model = RecruiterFlow
        fields = {
            "step": ["exact", "in"]
        }
