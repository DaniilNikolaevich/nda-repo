import datetime
import logging

from celery import shared_task
from django.utils import timezone

from base.utils.email import Email
from base.utils.exceptions import EmailSendError
from news_feed.models import SubscriptionEmail
from settings.settings import FRONTEND_BASE_URL
from vacancies.models import Vacancy

logger = logging.getLogger(__name__)


@shared_task
def send_notifications_about_new_vacancies():
    subscribed_users_email_list = list(SubscriptionEmail.objects.filter(
        is_active=True,
        subscription_type=SubscriptionEmail.SubscriptionType.VACANCIES
    ).values_list('email', flat=True))

    if not subscribed_users_email_list:
        logger.info("Пользователей, подписанных на вакансии не найдено")
        return None

    new_vacancies = Vacancy.objects.filter(created_at__gte=timezone.now() - datetime.timedelta(hours=24)).order_by(
        '-created_at').values('position__name', 'salary')

    message = ""
    for vacancy in new_vacancies:
        message += f"Вакансия: {vacancy['position__name']}\n" \
                   f"Зарплата: {vacancy['salary']} руб.\n\n"

    if not message:
        logger.info("Новых вакансий за последние сутки не найдено")
        return None

    email = Email()

    try:
        email.send_email_with_button(
            receivers=subscribed_users_email_list,
            subject="Новые вакансии за последние сутки",
            title="Новые вакансии за последние сутки",
            greeting=f"Здравствуйте! Вы получили данное сообщение, так как подписались на рассылку на сайте {FRONTEND_BASE_URL}. Вы можете ознакомиться с новыми вакансиями ниже!",
            main_text=message,
            button_text="Перейти к просмотру",
            button_link=FRONTEND_BASE_URL,
            bottom_text=f"""С уважением, PeopleFLow""",
        )
    except EmailSendError as error:
        logger.error(
            f"Письмо о новых вакансиях не было отправлено на почты {subscribed_users_email_list}. Ошибка: {error}")
        return None

    return True
