import logging
from datetime import timedelta

from celery import shared_task
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone

from base.ai.exceptions import OpenAIWrapperError
from base.ai.services import OpenAIWrapper
from base.utils.email import Email
from base.utils.exceptions import EmailSendError, S3ConnectionError
from base.utils.files import S3Wrapper
from settings.settings import FRONTEND_BASE_URL, S3_CV_BUCKET
from users.models import User, VerificationCode
from users.services import extract_text_from_pdf_file, set_user_data_based_on_cv_data

logger = logging.getLogger(__name__)


@shared_task
def send_verification_link_task(user_id, user_email):
    try:
        user = User.objects.get(id=user_id)
    except ObjectDoesNotExist:
        logger.error(
            f"Письмо для подтверждения Email не было отправлено на почту {user_email} т.к. пользователь с id={user_id} не найден")
        return None

    code_valid_until = timezone.now() + timedelta(minutes=VerificationCode.EMAIL_VERIFICATION_CODE_VALID_MINUTES)

    verification_code = VerificationCode.objects.create(
        user=user,
        valid_until=code_valid_until,
        email=user_email,
        verification_type=VerificationCode.VerificationType.SET_PASSWORD
    ).code

    email = Email()
    try:
        email.send_email_with_button(
            receivers=[user_email],
            subject="Подтверждение Email",
            title="Подтверждение Email",
            greeting=f"Здравствуйте, {user.fullname}!",
            main_text="Для подтверждения Email перейдите по ссылке ниже",
            button_text="Подтвердить Email",
            button_link=VerificationCode.SET_PASSWORD_LINK.format(
                base_url=FRONTEND_BASE_URL,
                verification_code=verification_code
            ),
            bottom_text="Если вы не регистрировались на нашем сайте, проигнорируйте это письмо"
        )
    except EmailSendError as error:
        logger.error(f"Письмо для подтверждения Email не было отправлено на почту {user_email}. Ошибка: {error}")
        return None


@shared_task
def send_password_reset_link_task(user_id):
    try:
        user = User.objects.get(id=user_id)
    except ObjectDoesNotExist:
        logger.error(
            f"Письмо для сброса пароля не было отправлено т.к. пользователь с id={user_id} не найден")
        return None

    code_valid_until = timezone.now() + timedelta(minutes=VerificationCode.PASSWORD_RESET_CODE_VALID_MINUTES)

    verification_code = VerificationCode.objects.create(
        user=user,
        valid_until=code_valid_until,
        email=user.email,
        verification_type=VerificationCode.VerificationType.PASSWORD_RESET
    ).code

    email = Email()
    try:
        email.send_email_with_button(
            receivers=[user.email],
            subject="Сброс пароля",
            title="Сброс пароля",
            greeting=f"Здравствуйте, {user.fullname}!",
            main_text="Для сброса пароля перейдите по ссылке ниже",
            button_text="Сбросить пароль",
            button_link=VerificationCode.PASSWORD_RESET_LINK.format(
                base_url=FRONTEND_BASE_URL,
                verification_code=verification_code
            ),
            bottom_text="Если вы не запрашивали сброс пароля, проигнорируйте это письмо"
        )
    except EmailSendError as error:
        logger.error(f"Письмо для сброса пароля не было отправлено на почту {user.email}. Ошибка: {error}")
        return None


@shared_task
def process_user_cv(user_id):
    """
    Находит резюме пользователя, вычленяет из него текст и обращается к OpenAI для получения
    сводки о резюме в формате JSON, после чего сохраняет данные пользователя в БД.
    """
    try:
        user = User.objects.get(id=user_id)
    except ObjectDoesNotExist:
        logger.error(f"Пользователь с id={user_id} не найден")
        return None

    try:
        s3 = S3Wrapper(bucket_name=S3_CV_BUCKET)
    except S3ConnectionError as error:
        logger.error(error)
        return None

    cv_file = s3.download_file(f"{user.info.cv}.pdf")
    cv_file_content = extract_text_from_pdf_file(cv_file)

    try:
        openai = OpenAIWrapper()
        cv_data = openai.process_cv(cv_file_content)
    except OpenAIWrapperError as error:
        logger.error(error)
        return None

    set_user_data_based_on_cv_data(user, cv_data)
