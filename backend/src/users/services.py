import io
import logging
import uuid
from datetime import datetime, timedelta

import jwt
import pdfplumber
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from django.utils import timezone
from jwt import ExpiredSignatureError

from settings.settings import ACCESS_TOKEN_SECRET_KEY, REFRESH_TOKEN_SECRET_KEY, ACCESS_TOKEN_LIFESPAN_MIN, \
    REFRESH_TOKEN_LIFESPAN_MIN
from users.exceptions import RefreshTokenExpired, RefreshTokenError
from users.models import User, UserEducation, UserWorkExperience

logger = logging.getLogger(__name__)


# Function to generate access token
def generate_access_token(user: User, exp_not_before=None) -> (str, datetime):
    expires_in = timezone.localtime() + timedelta(minutes=ACCESS_TOKEN_LIFESPAN_MIN)

    if exp_not_before:
        if expires_in > exp_not_before:
            expires_in = exp_not_before
    token_payload = {
        'iat': timezone.localtime(),
        'exp': expires_in,
        'sub': str(user.id),
        'role': user.role,
        'name': user.name,
        'surname': user.surname,
        'patronymic': user.patronymic,
        'email': user.email,
        'fullname': user.fullname
    }
    access_token = jwt.encode(token_payload, ACCESS_TOKEN_SECRET_KEY, algorithm='HS256')
    return access_token, expires_in


# Function to generate refresh token
def generate_refresh_token(user: User) -> (str, datetime):
    expires_in = timezone.localtime() + timedelta(minutes=REFRESH_TOKEN_LIFESPAN_MIN)
    token_id = str(uuid.uuid4())
    token_payload = {
        'iat': timezone.localtime(),
        'exp': expires_in,
        'sub': str(user.id),
        'tid': token_id
    }
    refresh_token = jwt.encode(token_payload, REFRESH_TOKEN_SECRET_KEY, algorithm='HS256')
    return refresh_token, expires_in


def verify_refresh_token(refresh_token):
    try:
        # Attempt to decode the token
        payload = jwt.decode(refresh_token, REFRESH_TOKEN_SECRET_KEY, algorithms='HS256')
    except ExpiredSignatureError:
        raise RefreshTokenExpired("Срок действия токена истек")
    except Exception:
        raise RefreshTokenError("Invalid token")

    try:
        user = User.objects.get(id=payload['sub'])
    except ObjectDoesNotExist:
        raise RefreshTokenError("Пользователь не найден")

    refresh_token_valid_until = datetime.fromtimestamp(payload['exp']).astimezone(tz=timezone.get_current_timezone())
    return user, refresh_token_valid_until


def extract_text_from_pdf_file(file):
    try:
        # If file is bytes (and not a file-like object), convert to BytesIO object
        if isinstance(file, bytes):
            file = io.BytesIO(file)

        with pdfplumber.open(file) as pdf:
            text = "".join(page.extract_text() for page in pdf.pages)
    except Exception as error:
        raise Exception(f"Failed to extract text from the file. Error: {error}")
    return text


def set_user_data_based_on_cv_data(user, cv_data):
    from base.ai.serializers import AICVSerializer

    cv_data_fields = [
        'sex', 'date_of_birth', 'country', 'city', 'contacts', 'about', 'ai_summary',
        'personalized_questions', 'relocation', 'business_trips', 'employment_type',
        'work_schedule', 'preferred_position', 'preferred_salary', 'skills',
        'work_experience', 'education'
    ]

    with transaction.atomic():
        for field, value in cv_data.items():
            if field in cv_data_fields:
                serializer = AICVSerializer(data={field: value}, partial=True)
                if serializer.is_valid():
                    valid_field = serializer.validated_data.get(field)
                    print(valid_field)
                    if field == 'date_of_birth':
                        setattr(user, field, valid_field)
                    elif field == 'education':
                        user.education.all().delete()
                        for education in valid_field:
                            education['user'] = user
                            UserEducation.objects.create(**education)
                    elif field == 'work_experience':
                        user.work_experience.all().delete()
                        for work_experience in valid_field:
                            work_experience['user'] = user
                            UserWorkExperience.objects.create(**work_experience)
                    elif field == 'skills':
                        user.info.skills.set(valid_field)
                    else:
                        setattr(user.info, field, valid_field)
                else:
                    logger.error(f"Failed to set user data based on CV data. Error: {serializer.errors}")

        user.save()
        user.info.save()
    return user
