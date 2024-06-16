import logging

from django.core.cache import cache
from django.db.models.signals import post_save
from django.db.models.signals import pre_save
from django.dispatch import receiver

from users.models import User
from vacancies.models import Vacancy
from .models import RecruiterFlow, FlowHistory

logger = logging.getLogger(__name__)

RECRUITER_RECRUITMENT_FLOW_CHANGED_DISPATCH_UID = "recruiter_recruitment_flow_post_save"
VACANCY_CHANGED_DISPATCH_UID = "vacancy_post_save"


@receiver(pre_save, sender=RecruiterFlow, dispatch_uid=RECRUITER_RECRUITMENT_FLOW_CHANGED_DISPATCH_UID)
def track_recruitment_flow_changes(sender, instance, **kwargs):
    """
    Отслеживает изменения в модели RecruiterFlow и записывает их в модель FlowHistory.
    """
    try:
        # Получение старых значений перед сохранением
        old_instance = RecruiterFlow.objects.get(pk=instance.pk)
    except sender.DoesNotExist:
        # Если экземпляр новый, ничего не делаем
        return None

    changes = []

    if old_instance.step != instance.step:
        changes.append(f"Был изменен шаг с '{old_instance.get_step_display()}' на '{instance.get_step_display()}'")

    if changes:
        FlowHistory.objects.create(
            recruitment_flow=instance,
            message="; ".join(changes)
        )


@receiver(post_save, sender=Vacancy, dispatch_uid=VACANCY_CHANGED_DISPATCH_UID)
def clear_suitable_candidates_cache(sender, instance, **kwargs):
    """
    Clears the cache when Vacancy is created or updated.
    """
    # Construct the cache key for the related vacancy search results.
    vacancy = instance.id
    cache_key = f"suitable_candidates_for_vacancy_{str(vacancy)}"
    cache.delete(cache_key)

    for user in User.objects.filter(is_active=True):
        cache_key = f"suitable_vacancies_for_candidate_{str(user.id)}"
        cache.delete(cache_key)

    for vacancy in Vacancy.objects.filter(status=Vacancy.VacancyStatus.ACTIVE):
        cache_key = f"similar_vacancies_{str(vacancy.id)}"
        cache.delete(cache_key)
