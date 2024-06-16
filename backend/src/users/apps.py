from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'

    def ready(self):
        # noinspection PyUnresolvedReferences
        from users import tasks
        from users.signals import clear_suitable_candidates_cache
