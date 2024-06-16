from django.core.cache import cache
from django.db.models.signals import post_save
from django.dispatch import receiver

from users.models import UserInformation
from vacancies.models import Vacancy

USER_INFORMATION_CHANGED_DISPATCH_UID = "user_information_post_save"


@receiver(post_save, sender=UserInformation, dispatch_uid=USER_INFORMATION_CHANGED_DISPATCH_UID)
def clear_suitable_candidates_cache(sender, instance, created, **kwargs):
    """
    Clears the cache when UserInformation is created or updated.
    """
    # Construct the cache key for the related vacancy search results.
    vacancies = list(Vacancy.objects.filter(status=Vacancy.VacancyStatus.ACTIVE).values_list('id', flat=True))
    for vacancy in vacancies:
        cache_key = f"suitable_candidates_for_vacancy_{str(vacancy)}"
        cache.delete(cache_key)

    cache_key = f"suitable_vacancies_for_candidate_{str(instance.id)}"
    cache.delete(cache_key)
