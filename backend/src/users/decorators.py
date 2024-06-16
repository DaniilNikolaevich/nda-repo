import functools

import jwt
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import status

from base.utils.http import Response
from settings.settings import ACCESS_TOKEN_SECRET_KEY
from users.models import User


def auth(view_func):
    @functools.wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        authorization = request.headers.get('Authorization')
        if not authorization:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Войдите в систему')
        if 'Bearer' not in authorization:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Войдите в систему')

        access_token = authorization.split()[-1]

        try:
            payload = jwt.decode(access_token, ACCESS_TOKEN_SECRET_KEY, algorithms=['HS256'])
        except jwt.InvalidTokenError:
            return Response(status=status.HTTP_401_UNAUTHORIZED, content='Обновите токен')

        try:
            user = User.objects.get(id=payload['sub'])
        except ObjectDoesNotExist:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Пользователь не найден')

        if not user.is_active:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Пользователь заблокирован')

        kwargs['user'] = user

        return view_func(request, *args, **kwargs)

    return _wrapped_view
