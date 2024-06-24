import datetime
import json
import logging
import os
from pathlib import Path

from celery.schedules import crontab

BASE_DIR = Path(__file__).resolve().parent.parent

DEBUG = True if os.getenv('DEBUG') == 'True' else False
PRODUCTION = True if os.getenv('PRODUCTION') == 'True' else False
SECRET_KEY = os.getenv('SECRET_KEY', '!h14ol#x91l@qwljed6)dr(wdeCorplxoa3lWill)tt28y-Win&+@i66u_)#gih=')

ALLOWED_HOSTS = json.loads(os.getenv('ALLOWED_HOSTS'))
CSRF_TRUSTED_ORIGINS = json.loads(os.getenv('CSRF_TRUSTED_ORIGINS'))
CORS_ALLOW_ALL_ORIGINS = True

S3_SERVER = os.getenv('S3_SERVER')
S3_ACCESS_KEY = os.getenv('S3_ACCESS_KEY')
S3_SECRET_KEY = os.getenv('S3_SECRET_KEY')
S3_BUCKET_NEWS = os.getenv('S3_BUCKET_NEWS', "peopleflow-news-documents")
S3_USER_PHOTO_BUCKET = os.getenv('S3_USER_PHOTO_BUCKET')
S3_CV_BUCKET = os.getenv('S3_CV_BUCKET')
S3_CALENDARS_BUCKET = os.getenv('S3_CALENDARS_BUCKET')
S3_COMMENTS_BUCKET = os.getenv('S3_COMMENTS_BUCKET')

# postgres
DATABASE_ENGINE = os.getenv('DATABASE_ENGINE')
DATABASE_HOST = os.getenv('DATABASE_HOST')
DATABASE_PORT = os.getenv('DATABASE_PORT')
POSTGRES_DB = os.getenv('POSTGRES_DB')
POSTGRES_USER = os.getenv('POSTGRES_USER')
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD')

# redis
REDIS_HOST = os.getenv('REDIS_HOST')
REDIS_PORT = os.getenv('REDIS_PORT')
REDIS_URL = os.getenv('REDIS_URL')
REDIS_PASSWORD = os.getenv('REDIS_PASSWORD')

INSTALLED_APPS = [
    'django.contrib.postgres',
    'django.contrib.admin',
    'django.contrib.auth',
    'corsheaders',
    'django_filters',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_celery_results.apps.CeleryResultConfig',
    'django_celery_beat.apps.BeatConfig',
    'base.apps.BaseConfig',
    'settings.apps.SettingsConfig',
    'users.apps.UsersConfig',
    'news_feed.apps.NewsFeedConfig',
    'vacancies.apps.VacanciesConfig',
    "chat.apps.ChatConfig",
    "calendars.apps.CalendarsConfig",
    "dashboard.apps.DashboardConfig"

]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.locale.LocaleMiddleware'
]

ROOT_URLCONF = 'settings.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': ['templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'settings.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': DATABASE_ENGINE,
        'NAME': POSTGRES_DB,
        'USER': POSTGRES_USER,
        'PASSWORD': POSTGRES_PASSWORD,
        'HOST': DATABASE_HOST,
        'PORT': DATABASE_PORT,
    },
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LOG_FILE = os.getenv('LOG_FILE')
VERBOSE_LOG_FILE = os.getenv('VERBOSE_LOG_FILE')


class MaxLevelFilter:
    def __init__(self, max_level):
        self.__level = max_level

    def filter(self, logRecord):
        return logRecord.levelno <= self.__level


class ConsoleFilter:
    def filter(self, *args, **kwargs):
        if DEBUG:
            return True
        else:
            return False


ROOT_LOGGER_HANDLER = ['file']
BASE_LOGGER_HANDLER = ['warning_file', 'verbose_file']
CELERY_LOGGER_HANDLER = ['file']

if DEBUG:
    ROOT_LOGGER_HANDLER = ['file', 'console']
    CELERY_LOGGER_HANDLER = ['file', 'console']

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'high': {
            'format': '{asctime} {levelname} {name} [line {lineno}] {message}',
            'style': '{',
        },
        'low': {
            'format': '{asctime} {message}',
            'style': '{',
        },
    },
    'filters': {
        'critical_filter': {
            '()': MaxLevelFilter,
            'max_level': logging.CRITICAL
        },
        'error_filter': {
            '()': MaxLevelFilter,
            'max_level': logging.ERROR
        },
        'warning_filter': {
            '()': MaxLevelFilter,
            'max_level': logging.WARNING
        },
        'info_filter': {
            '()': MaxLevelFilter,
            'max_level': logging.INFO
        },
        'debug_filter': {
            '()': MaxLevelFilter,
            'max_level': logging.DEBUG
        },
        'console_filter': {
            '()': ConsoleFilter,
        }
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'formatter': 'high',
            'filename': LOG_FILE,
            'maxBytes': 1024 * 1024 * 500,  # 500 Mb
            'backupCount': 10
        },
        'warning_file': {
            'level': 'WARNING',
            'class': 'logging.handlers.RotatingFileHandler',
            'formatter': 'high',
            'filename': LOG_FILE,
            'maxBytes': 1024 * 1024 * 500,  # 500 Mb
            'backupCount': 10
        },
        'verbose_file': {
            'level': 'INFO' if not DEBUG else 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'formatter': 'high',
            'filters': ['info_filter'],
            'filename': VERBOSE_LOG_FILE,
            'maxBytes': 1024 * 1024 * 500,  # 500 Mb
            'backupCount': 10
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'high',
            'filters': ['console_filter']
        },
    },
    'loggers': {
        'root': {
            'handlers': ROOT_LOGGER_HANDLER,
            'level': 'INFO',
        },
        'base': {
            'handlers': BASE_LOGGER_HANDLER,
            'level': 'INFO',
            'propagate': False,
        },
        'celery': {
            'handlers': CELERY_LOGGER_HANDLER,
            'level': 'INFO',
        },
    }
}

LANGUAGE_CODE = 'ru'
TIME_ZONE = 'Europe/Moscow'
USE_I18N = True
USE_TZ = True

STATIC_URL = os.getenv('STATIC_URL')
STATIC_ROOT = os.getenv('STATIC_ROOT')

TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
USER_TELEGRAM_BOT_TOKEN = os.getenv('USER_TELEGRAM_BOT_TOKEN')
USER_TELEGRAM_BOT_USERNAME = os.getenv('USER_TELEGRAM_BOT_USERNAME')
DEBUG_CHAT_ID = os.getenv('DEBUG_CHAT_ID')

# celery
timezone = 'Europe/Moscow'
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 90 * 60
CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL')
CELERY_RESULT_BACKEND = 'django-db'
DJANGO_CELERY_RESULTS_TASK_ID_MAX_LENGTH = 191
CELERY_CACHE_BACKEND = 'django-cache'
DJANGO_CELERY_BEAT_TZ_AWARE = True

# mail
EMAIL_HOST = os.getenv('EMAIL_HOST')
EMAIL_PORT = os.getenv('EMAIL_PORT')
EMAIL_ADDRESS = os.getenv('EMAIL_ADDRESS')
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD')

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [],
    'DEFAULT_PERMISSION_CLASSES': [],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
    ],
    'EXCEPTION_HANDLER': 'base.utils.exceptions.api_exception_handler'
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

LOCALE_PATHS = ['/src/locale']

BACKEND_BASE_URL = os.getenv('BACKEND_BASE_URL')
FRONTEND_BASE_URL = os.getenv('FRONTEND_BASE_URL')

ACCESS_TOKEN_SECRET_KEY = os.getenv('ACCESS_TOKEN_SECRET_KEY', 'JpmJFqT6DXDCx4AFa3CNRHRudbvH4vLZ')
REFRESH_TOKEN_SECRET_KEY = os.getenv('REFRESH_TOKEN_SECRET_KEY', 'mqUW9sVBSL8SybMJrcPaF3uwNDDhqcmP')
ACCESS_TOKEN_LIFESPAN_MIN = int(os.getenv('ACCESS_TOKEN_LIFESPAN_MIN', 60 * 24))
REFRESH_TOKEN_LIFESPAN_MIN = int(os.getenv('REFRESH_TOKEN_LIFESPAN_MIN', 60 * 24 * 7))

RSS_NEWS_IMPORT_INTERVAL_IN_SEC = 60 * 60 * 24

CELERY_BEAT_SCHEDULE = {
    'rss_news_import': {
        'task': 'news_feed.tasks.import_news_from_rss',
        'schedule': datetime.timedelta(seconds=RSS_NEWS_IMPORT_INTERVAL_IN_SEC)
    },
    'update_calendars': {
        'task': 'calendars.tasks.update_calendars',
        'schedule': datetime.timedelta(seconds=60)
    },
    'send_notifications_about_new_vacancies': {
        'task': 'vacancies.tasks.send_notifications_about_new_vacancies',
        'schedule': crontab(hour=20, minute=0)
    },
    'send_notifications_about_new_news': {
        'tasks': 'news_feed.tasks.send_notifications_about_new_news',
        'schedule': crontab(hour=20, minute=0)
    }
}
OPENAI_ORGANIZATION_ID = os.getenv("OPENAI_ORGANIZATION_ID")
OPENAI_PROJECT_ID = os.getenv("OPENAI_PROJECT_ID")
OPENAI_SERVICE_ACCOUNT_ID = os.getenv("OPENAI_SERVICE_ACCOUNT_ID")
OPENAI_SERVICE_ACCOUNT_SECRET_KEY = os.getenv("OPENAI_SERVICE_ACCOUNT_SECRET_KEY")
OPENAI_PROXY_URL = os.getenv("OPENAI_PROXY_URL")

CENTRIFUGO_API_KEY = os.getenv("CENTRIFUGO_API_KEY")
CENTRIFUGO_API_URL = os.getenv("CENTRIFUGO_API_URL")
CENTRIFUGO_HMAC_SECRET_KEY = os.getenv("CENTRIFUGO_HMAC_SECRET_KEY")

YANDEX_OAUTH_TOKEN = os.getenv("YANDEX_OAUTH_TOKEN")
