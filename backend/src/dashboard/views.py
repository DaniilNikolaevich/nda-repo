from django.db.models import Count
from django.db.models import ExpressionWrapper, F, Avg, fields
from django.db.models.functions import TruncDate
from django.utils.decorators import method_decorator
from rest_framework import status
from rest_framework.views import APIView

from base.utils.decorators import tryexcept, log_action
from base.utils.http import Response
from dashboard.models import VacancyStatistic
from users.decorators import auth
from vacancies.models import RecruiterFlow, Vacancy


# Create your views here.

@method_decorator([tryexcept, auth, log_action], name='dispatch')
class AverageVacancyResponseTimeView(APIView):
    def dispatch(self, request, *args, **kwargs):
        current_user = kwargs.get('user')
        if not current_user.is_staff:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')

        return super().dispatch(request, *args, **kwargs)

    def get(self, request, user, *args, **kwargs):
        avg_time_difference = RecruiterFlow.objects.filter(
            step=RecruiterFlow.Step.JOB_OFFER,
            vacancy__responsible_recruiter=user).annotate(
            time_diff=ExpressionWrapper(
                F('updated_at') - F('created_at'),
                output_field=fields.DurationField()
            )
        ).aggregate(average_time=Avg('time_diff'))

        avg_time = avg_time_difference['average_time']
        if avg_time is None:
            days = None
            hours = None
        else:
            days = avg_time.days
            hours = avg_time.total_seconds() // 3600 % 24
        return Response({"days": days, "hours": hours})


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class VacanciesStatusDistributionView(APIView):
    def dispatch(self, request, *args, **kwargs):
        current_user = kwargs.get('user')
        if not current_user.is_staff:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')

        return super().dispatch(request, *args, **kwargs)

    def get(self, request, user, *args, **kwargs):
        vacancy_status_counts = Vacancy.objects.filter(responsible_recruiter=user).values('status').annotate(
            count=Count('id')).order_by('status')

        status_mapping = {
            Vacancy.VacancyStatus.NEW: {'name': 'Новая', 'color': 'rgb(34, 139, 230)'},
            Vacancy.VacancyStatus.ACTIVE: {'name': 'Активная', 'color': 'rgb(250, 176, 5) '},
            Vacancy.VacancyStatus.NON_ACTIVE: {'name': 'Неактивная', 'color': 'rgb(250, 82, 82)'},
            Vacancy.VacancyStatus.COMPLETED: {'name': 'Завершенная', 'color': 'rgb(47, 158, 68)'},
            Vacancy.VacancyStatus.ARCHIVE: {'name': 'Архивная', 'color': 'rgb(144, 146, 150)'}
        }

        formatted_counts = [
            {
                'name': status_mapping[item['status']]['name'],
                'value': item['count'],
                'color': status_mapping[item['status']]['color']
            }
            for item in vacancy_status_counts
        ]

        return Response(formatted_counts)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class VacancyViewCountView(APIView):
    def dispatch(self, request, *args, **kwargs):
        current_user = kwargs.get('user')
        if not current_user.is_staff:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')

        return super().dispatch(request, *args, **kwargs)

    def get(self, request, user, *args, **kwargs):

        total_views = 0

        # Query to group and count views by date and vacancy
        views_by_date = VacancyStatistic.objects.filter(vacancy__responsible_recruiter=user).annotate(
            date=TruncDate('view_time')
        ).values(
            'date', 'vacancy__position__name'
        ).annotate(
            views=Count('id')
        ).order_by('date', 'vacancy__position__name')

        # Collect unique dates and vacancies


        unique_dates = set(views_by_date.values_list('date', flat=True))
        unique_vacancies = Vacancy.objects.filter(responsible_recruiter=user).values_list('position__name',
                                                                                          flat=True).distinct()


        # Initialize data structure
        formatted_data = []
        for date_entry in unique_dates:
            date_str = date_entry.strftime('%Y-%m-%d')
            daily_data = {'date': date_str}

            for vacancy_name in unique_vacancies:
                daily_data[vacancy_name] = 0

            formatted_data.append(daily_data)

        # Populate the data
        for entry in views_by_date:
            date_str = entry['date'].strftime('%Y-%m-%d')
            for daily_data in formatted_data:
                if daily_data['date'] == date_str:
                    daily_data[entry['vacancy__position__name']] = entry['views']
                    total_views += entry['views']



        return Response({"data": formatted_data, "total_views": total_views})
