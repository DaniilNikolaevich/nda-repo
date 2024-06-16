from django.apps import AppConfig


class VacanciesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'vacancies'

    def ready(self):
        # noinspection PyUnresolvedReferences
        from vacancies.signals import track_recruitment_flow_changes, clear_suitable_candidates_cache
