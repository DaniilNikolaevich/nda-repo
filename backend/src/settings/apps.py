from django.apps import AppConfig


class SettingsConfig(AppConfig):
    name = 'settings'

    # noinspection PyUnresolvedReferences
    def ready(self):
        ...
