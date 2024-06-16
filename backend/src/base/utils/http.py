import datetime
import json
import logging
from typing import OrderedDict

from django.http import HttpResponse
from django.utils import timezone
from rest_framework.utils.serializer_helpers import ReturnDict, ReturnList

try:
    from rest_framework.utils.serializer_helpers import OrderedDict
except ImportError:
    from collections import OrderedDict

from base.utils.exceptions import BadRequestException
from base.utils.helpers import CustomDjangoJSONEncoder

import jwt
from django.core.exceptions import ObjectDoesNotExist

from settings.settings import ACCESS_TOKEN_SECRET_KEY
from users.models import User

logger = logging.getLogger(__name__)


def is_json(content):
    try:
        json.loads(content)
    except Exception:
        return False
    return True


def Response(content=None, status: int = 200, headers: dict = None, cookies: dict = None):
    """
    Функция сериализует получаемый content, добавляет заголовок CORS,
    а также, принимает заданные header.
    """
    if content is None:
        response = HttpResponse(status=status)
    elif is_json(content):
        response = HttpResponse(content, content_type='application/json', status=status)
    elif isinstance(content, str):
        content = {"message": content}
        json_data = json.dumps(content, ensure_ascii=False, cls=CustomDjangoJSONEncoder)
        response = HttpResponse(json_data, content_type='application/json', status=status)
    elif type(content) in [dict, list, ReturnDict, OrderedDict, ReturnList]:
        json_data = json.dumps(content, ensure_ascii=False, cls=CustomDjangoJSONEncoder)
        response = HttpResponse(json_data, content_type='application/json', status=status)
    else:
        response = HttpResponse(content, content_type='text/plain', status=status)

    response['Access-Control-Allow-Origin'] = '*'
    if headers:
        for header in headers:
            response[header] = headers[header]

    if cookies:
        for key, cookie_settings in cookies.items():
            if isinstance(cookie_settings, str):
                response.set_cookie(key=key, value=cookie_settings)
            elif isinstance(cookie_settings, dict):
                value = cookie_settings.get('value')
                secure = cookie_settings.get('secure', True)
                httponly = cookie_settings.get('httponly', False)
                same_site = cookie_settings.get('same_site', 'None')
                expires = cookie_settings.get('expires_min', None)
                if expires:
                    try:
                        expires = timezone.now() + datetime.timedelta(expires)
                    except Exception:
                        expires = None
                path = cookie_settings.get('path', '/')
                response.set_cookie(key=key, value=value, secure=secure, httponly=httponly, samesite=same_site,
                                    expires=expires, path=path)
            else:
                continue

    return response


def clean_get_params(request):
    """
    Функция очищает параметры в GET запросе и проверяет, чтобы они были валидные
    """
    search = request.GET.get('search')
    page = request.GET.get('page')
    items_per_page = request.GET.get('itemsPerPage')
    sort_by = request.GET.getlist('sortBy')
    sort_desc = request.GET.getlist('sortDesc')
    if sort_by and sort_desc:
        if len(sort_by) != len(sort_desc):
            raise BadRequestException("Некорректные параметры в запросе")
        for index, value in enumerate(sort_desc):
            if value not in ['true', 'false']:
                raise BadRequestException("Некорректные параметры в запросе")
            else:
                sort_desc[index] = '-' if value == 'true' else ''
                # True - desc, False - asc
    else:
        sort_by = None
        sort_desc = None
    if not search:
        search = None
    else:
        search = search.lower().strip()

    if page:
        if not page.isdigit():
            page = 1
    else:
        page = 1
    if items_per_page:
        if items_per_page == '-1':
            items_per_page = None
        elif not items_per_page.isdigit():
            items_per_page = 20
    else:
        items_per_page = 20

    return search, page, items_per_page, sort_by, sort_desc


def get_user_from_authorization_header(authorization):
    if not authorization:
        return None
    if 'Bearer' not in authorization:
        return None

    access_token = authorization.split()[-1]
    try:
        payload = jwt.decode(access_token, ACCESS_TOKEN_SECRET_KEY, algorithms=['HS256'])
    except jwt.InvalidTokenError:
        return None

    try:
        user = User.objects.get(id=payload['sub'])
    except ObjectDoesNotExist:
        return None

    if not user.is_active:
        return None

    return user
