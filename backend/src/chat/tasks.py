import json
import logging

import requests
from celery import shared_task
from django.conf import settings

from users.models import User
from users.serializer import UserSerializer

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=5)
def send_message_to_centrifugo(self, channel: str, author_id, message, headers=None, url=None, send_notification=False):
    if not url:
        url = f"{settings.CENTRIFUGO_API_URL}/publish"
    if not headers:
        headers = {"X-API-Key": settings.CENTRIFUGO_API_KEY}
    if author_id:
        try:
            user = User.objects.get(id=author_id)
            user_data = UserSerializer(user).data
        except User.DoesNotExist:
            return
    else:
        user_data = None
    payload = {
        'channel': channel,
        'data': {
            "author": user_data,
            "message": message
        }
    }
    payload = json.dumps(payload, ensure_ascii=False).encode('utf8')
    try:
        response = requests.post(url, data=payload, headers=headers)
        if response.status_code != 200:
            raise ValueError('Unexpected status code: {}'.format(response.status_code))
        else:
            logger.info('Message sent to centrifugo')

        if send_notification:
            from base.utils.notification import send_telegram_notification, send_email_notification
            from chat.models import Chat
            try:
                user = Chat.objects.get(id=channel).candidate
            except Chat.DoesNotExist:
                return
            send_telegram_notification.apply_async(kwargs={"message": f"У вас новое сообщение на платформе!", 'user_id': str(user.id)})
            data = {
                "title": "У вас новое сообщение на платформе!",
                "greeting": "Здравствуйте!",
                "main_text": "У вас новое сообщение на платформе!",
                "bottom_text": "С уважением, команда Reksoft",
                "button_text": "Перейти",
                "button_link": f"{settings.FRONTEND_BASE_URL}",
            }
            send_email_notification.apply_async(kwargs={'user_id': str(user.id), **data})
    except Exception as exc:
        raise self.retry(exc=exc)
