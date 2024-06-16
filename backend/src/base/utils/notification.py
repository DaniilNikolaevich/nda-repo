import json
import logging
import traceback
from typing import Union
from uuid import UUID

import requests
from celery import shared_task

from base.utils.email import Email
from settings.settings import DEBUG_CHAT_ID, TELEGRAM_BOT_TOKEN, USER_TELEGRAM_BOT_TOKEN
from users.models import User

logger = logging.getLogger(__name__)


@shared_task
def telegram_message(info: str,
                     chat_id: str = None,
                     disable_notification: bool = False,
                     parse_mode: str = None) -> None:
    """Функция присылает сообщение в Telegram."""
    try:
        if chat_id is None:
            chat_id = DEBUG_CHAT_ID

        logger.info(
            f"[DATA_SEND_TO_TELEGRAM] {info}. [CHAT_ID] {chat_id} [DISABLE_NOTIFICATION] {disable_notification} [PARSE_MODE] {parse_mode}")

        headers = {'Content-Type': 'application/json'}
        data = {
            "chat_id": chat_id,
            "disable_notification": disable_notification,
        }
        if parse_mode:
            data['parse_mode'] = parse_mode

        if len(info) > 4096:
            for x in range(0, len(info), 4096):
                data['text'] = info[x:x + 4096]
                requests.post(
                    f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage', headers=headers,
                    data=json.dumps(data, ensure_ascii=False).encode('utf-8'), timeout=3)
        else:
            data['text'] = info
            requests.post(
                f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage', headers=headers,
                data=json.dumps(data, ensure_ascii=False).encode('utf-8'), timeout=3)
        return None
    except:
        logger.warning(traceback.format_exc())
        return


class EmailNotifier(Email):

    def send(self,
             user: Union[User, UUID, str],
             title: str,
             greeting: str,
             main_text: str,
             bottom_text: str,
             button_text: str,
             button_link: str,
             subject: Union[None, str] = None,
             ) -> bool:
        from users.models import User
        if isinstance(user, UUID) or isinstance(user, str):
            try:
                user = User.objects.get(id=user)
            except User.DoesNotExist:
                return False
        else:
            user = user

        if user.email:
            return self.send_email_with_button(
                receivers=[user.email],
                title=title,
                greeting=greeting,
                main_text=main_text,
                bottom_text=bottom_text,
                button_text=button_text,
                button_link=button_link,
                subject=subject
            )

        return False


class TelegramNotifier:
    headers = {'Content-Type': 'application/json'}

    def send(self, user: Union[User, UUID, str], message: str) -> bool:
        from users.models import UserInformation
        if isinstance(user, UUID) or isinstance(user, str):
            try:
                user_info = UserInformation.objects.get(user_id=user)
            except UserInformation.DoesNotExist:
                return False
        else:
            user_info = user.info

        if user_info.telegram_chat_id:
            chat_id = user_info.telegram_chat_id
            data = {'chat_id': chat_id, 'text': message, 'parse_mode': 'html'}
            if len(message) > 4096:
                for x in range(0, len(message), 4096):
                    data['text'] = message[x:x + 4096]
                    resp = requests.post(
                        f'https://api.telegram.org/bot{USER_TELEGRAM_BOT_TOKEN}/sendMessage', headers=self.headers,
                        data=json.dumps(data, ensure_ascii=False).encode(), timeout=3)
            else:
                data['text'] = message
                resp = requests.post(
                    f'https://api.telegram.org/bot{USER_TELEGRAM_BOT_TOKEN}/sendMessage', headers=self.headers,
                    data=json.dumps(data, ensure_ascii=False).encode(), timeout=3)
            if resp.status_code == 200:
                return True
            else:
                logger.error(f"TelegramNotifier: {resp.text}")
                return False
        return False


@shared_task()
def send_telegram_notification(user_id: Union[str], message: str) -> bool:
    telegram_notifier = TelegramNotifier()
    return telegram_notifier.send(user_id, message)


@shared_task()
def send_email_notification(user_id: Union[str], title: str, greeting: str, main_text: str, bottom_text: str,
                            button_text: str,
                            button_link: str, subject: str) -> bool:
    email_notifier = EmailNotifier()
    return email_notifier.send(user_id, title, greeting, main_text, bottom_text, button_text, button_link, subject)
