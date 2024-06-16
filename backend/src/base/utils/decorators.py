import functools
import logging
import time
import traceback
import warnings

from django.core.cache import CacheKeyWarning
from django.db import connection, reset_queries
from django.http import HttpResponse, JsonResponse
from rest_framework import status

from base.utils.http import Response
from base.utils.notification import telegram_message
from settings.settings import DEBUG

warnings.simplefilter("ignore", CacheKeyWarning)

logger = logging.getLogger(__name__)


def check_http_method(allowed_methods):
    """
    Декоратор, проверяющий разрешенные HTTP методы
    """

    def decorator(called_func):
        def wrap(request, *args, **kwargs):
            if request.method == 'OPTIONS':
                if isinstance(allowed_methods, list):
                    allowed_methods.append('OPTIONS')
                    allow_header = " ".join(allowed_methods)
                else:
                    allow_header = f'OPTIONS {allowed_methods}'
                return Response(allowed_methods, headers={'Allow': allow_header})
            if request.method not in allowed_methods:
                return Response(content=f"Метод {request.method} запрещен", status=status.HTTP_400_BAD_REQUEST)
            return called_func(request, *args, **kwargs)

        return wrap

    return decorator


def log_action(called_func):
    """
    Декоратор, записывающий действия пользователей.
    """

    def wrap(request, *args, **kwargs):
        try:
            user_id = kwargs['user_id']
            user = f"[{user_id}]"
        except KeyError:
            user = None

        roles = kwargs.get('roles', [])
        roles_list = list(roles) if roles else []

        start_time = time.time()
        function = called_func(request, *args, **kwargs)
        end_time = time.time()
        taken_time = f"{(end_time - start_time) * 1000:.1f} мс."

        status_code = None
        if isinstance(function, (HttpResponse, JsonResponse)):
            status_code = function.status_code

        action = {
            "taken_time": taken_time,
            "user": user,
            "roles": roles_list,
            "method": request.method,
            "request_path": request.get_full_path(),
            "remote_address": request.META["REMOTE_ADDR"],
            "status_code": status_code,
        }
        logger.info(action)
        return function

    return wrap


def tryexcept(called_func):
    """
    Декоратор, который оборачивает вызываемую функцию в try - except
    и в случае непредвиденной ошибки, шлет сообщение об этом в телеграм

    """

    def wrap(request, *args, **kwargs):
        if DEBUG:
            return called_func(request, *args, **kwargs)
        else:
            try:
                return called_func(request, *args, **kwargs)
            except Exception as error:
                authorization = request.headers.get("Authorization")
                message = f"""
                    Authorization: {authorization}
                    URL: {request.get_full_path()}
                    Error: {error}
                    Traceback: {traceback.format_exc()}"""
                telegram_message(message)
                logger.error(message)

                return Response(content="Произошла непредвиденная ошибка. Разработчики уже исправляют ее.",
                                status=status.HTTP_400_BAD_REQUEST)

    return wrap


def query_debugger(func):
    @functools.wraps(func)
    def inner_func(*args, **kwargs):
        reset_queries()

        start_queries = len(connection.queries)

        start = time.perf_counter()
        result = func(*args, **kwargs)
        end = time.perf_counter()

        end_queries = len(connection.queries)

        print(f"Function : {func.__name__}")
        print(f"Number of Queries : {end_queries - start_queries}")
        print(f"Finished in : {(end - start):.2f}s")
        return result

    return inner_func
