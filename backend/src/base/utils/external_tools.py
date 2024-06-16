import logging
import traceback

from base.utils.notification import telegram_message
from settings.settings import YANDEX_OAUTH_TOKEN

logger = logging.getLogger(__name__)


def get_meeting_link() -> str:
    """
    Функция создает ссылку для создания конференции в Яндекс.Телемосте
    """
    import requests
    import json

    url = "https://cloud-api.yandex.net/v1/telemost-api/conferences"

    payload = json.dumps({
        "access_level": "PUBLIC"
    })
    headers = {
        'Authorization': f'OAuth {YANDEX_OAUTH_TOKEN}',
        'Content-Type': 'application/json'
    }
    try:
        response = requests.request("POST", url, headers=headers, data=payload)
        join_url = json.loads(response.text).get('join_url')
    except Exception as e:
        logger.error(f"Ошибка при создании ссылки на конференцию: {e}")
        telegram_message(f"Ошибка при создании ссылки на конференцию: {e}.\n {traceback.format_exc()}")
        join_url = None
    return join_url
