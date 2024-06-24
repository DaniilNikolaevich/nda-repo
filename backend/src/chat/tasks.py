import json
import logging

import requests
from celery import shared_task
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist

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
            send_telegram_notification.apply_async(
                kwargs={"message": f"У вас новое сообщение на платформе!", 'user_id': str(user.id)})
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


@shared_task()
def set_read_status_new_message(message_id: str):
    from chat.models import ChatMessage
    try:
        message = ChatMessage.objects.select_related('chat').get(id=message_id)
        chat = message.chat
    except (ObjectDoesNotExist, ValueError):
        return False
    users_in_chat = check_presence_in_chat(str(chat.id))
    for user_id in users_in_chat:
        if str(chat.recruiter.id) == user_id:
            message.is_read_by_recruiter = True
        elif str(chat.candidate.id) == user_id:
            message.is_read_by_candidate = True
        else:
            continue
    message.save()
    send_notification_on_new_message.apply_async(kwargs={
        "message_id": message_id
    })
    return True


@shared_task()
def send_notification_on_new_message(message_id: str):
    from base.utils.notification import send_email_notification
    from chat.models import ChatMessage
    def send_email(user, chat_name, message, author):
        data = {
            "title": f"У вас новое сообщение в чате «{chat_name}» на платформе!",
            "subject": f"У вас новое сообщение в чате «{chat_name}» на платформе!",
            "greeting": "Здравствуйте!",
            "main_text": f"У вас новое сообщение на платформе!<br><b>Текст сообщения:</b> {message}<br><b>Автор:</b> {author.fullname}",
            "bottom_text": "С уважением, команда Reksoft",
            "button_text": "Перейти",
            "button_link": f"{settings.FRONTEND_BASE_URL}",
        }
        send_email_notification.apply_async(kwargs={'user_id': str(user.id), **data})

    try:
        message = ChatMessage.objects.select_related('chat').get(id=message_id)
        chat = message.chat
    except (ObjectDoesNotExist, ValueError):
        return False
    if not message.is_read_by_recruiter:
        send_email(chat.recruiter, chat.name, message.message, message.author)
    if not message.is_read_by_candidate:
        send_email(chat.candidate, chat.name, message.message, message.author)
    return True


def check_presence_in_chat(channel_id: str) -> list:
    def get_user_list(json_data):
        user_list = [details['user'] for details in json_data['result']['presence'].values()]
        return user_list

    url = f"{settings.CENTRIFUGO_API_URL}/presence"

    payload = json.dumps({
        "channel": channel_id
    })
    headers = {
        'Content-Type': 'application/json',
        'X-API-Key': settings.CENTRIFUGO_API_KEY,
    }
    try:
        response = requests.request("POST", url, headers=headers, data=payload)
        user_list = get_user_list(response.json())
        return user_list
    except Exception:
        return []
