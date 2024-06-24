from django.db import models

from base.models import BaseModel
from vacancies.models import Vacancy


class VacancyStatistic(BaseModel):
    vacancy = models.ForeignKey(
        Vacancy,
        on_delete=models.CASCADE,
        verbose_name='Вакансия',
        related_name='statistics'
    )
    view_time = models.DateTimeField(
        verbose_name="Время просмотра",
        auto_now_add=True
    )

    class Meta:
        verbose_name = 'Статистика вакансии'
        verbose_name_plural = 'Статистика вакансий'
        ordering = ['-created_at']
