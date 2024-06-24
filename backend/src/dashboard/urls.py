from django.urls import path

from dashboard.views import AverageVacancyResponseTimeView, VacanciesStatusDistributionView, VacancyViewCountView

urlpatterns = [
    path('avg-vacancies-response', AverageVacancyResponseTimeView.as_view()),
    path('vacancies-status-distribution', VacanciesStatusDistributionView.as_view()),
    path('vacancies-views-count', VacancyViewCountView.as_view())
]
