import datetime
import logging

import extruct
import feedparser
import requests
from celery import shared_task
from django.utils import timezone
from html_sanitizer import Sanitizer

from base.utils.email import Email
from base.utils.exceptions import EmailSendError
from news_feed.models import News, NewsTag, SubscriptionEmail
from settings.settings import FRONTEND_BASE_URL

logger = logging.getLogger(__name__)


@shared_task
def import_news_from_rss():
    urls = [
        "https://habr.com/ru/rss/articles/top/daily/?fl=ru",
        "https://vc.ru/rss/all",
        "https://tproger.ru/feed/",
    ]
    for url in urls:
        rss = feedparser.parse(url)
        list_external_ids = list(News.objects.filter(is_external=True).values_list('external_id', flat=True))
        for entry in rss.entries:
            if entry['id'] in list_external_ids:
                continue
            sanitizer = Sanitizer({
                "tags": {
                    "a", "h1", "h2", "h3", "strong", "em", "p", "ul", "ol",
                    "li", "br", "sub", "sup", "hr",
                },
                'attributes': {},
                'empty': set(),
                'separate': set('p'),
            })
            entry['summary'] = sanitizer.sanitize(entry['summary']).replace('Читать далее', '').replace('Читать дальше',
                                                                                                        '')
            try:
                r = requests.get(entry['link'])
                data = extruct.extract(r.text, syntaxes=['opengraph'], uniform=True)
                cover = data['opengraph'][0]['og:image']
            except:
                cover = None
            news = News.objects.create(
                title=entry['title'],
                brief_content=entry['summary'],
                content=entry['summary'],
                external_link=entry['link'],
                created_at=entry['published'],
                is_external=True,
                external_id=entry['id'],
                external_cover=cover
            )
            tags = []
            if 'tags' not in entry:
                continue
            for tag in entry['tags']:
                news_tag, _ = NewsTag.objects.get_or_create(name=tag['term'].capitalize())
                tags.append(news_tag)
            news.tags.add(*tags)
            news.save()


@shared_task
def send_notifications_about_new_news():
    subscribed_users_email_list = list(SubscriptionEmail.objects.filter(
        is_active=True,
        subscription_type=SubscriptionEmail.SubscriptionType.NEWS
    ).values_list('email', flat=True))

    if not subscribed_users_email_list:
        logger.info("Пользователей, подписанных на новости не найдено")
        return None

    new_news = News.objects.filter(created_at__gte=timezone.now() - datetime.timedelta(hours=24)).order_by(
        '-created_at').values('title')

    message = ""
    for news in new_news:
        message += f"Новость: {news['title'][:25]}...\n\n"

    if not message:
        logger.info("Новых новостей за последние сутки не найдено")
        return None

    email = Email()

    try:
        email.send_email_with_button(
            receivers=subscribed_users_email_list,
            subject="Новости за последние сутки",
            title="Новости за последние сутки",
            greeting=f"Здравствуйте! Вы получили данное сообщение, так как подписались на рассылку на сайте {FRONTEND_BASE_URL}. Вы можете ознакомиться с новостями ниже!",
            main_text=message,
            button_text="Перейти к просмотру",
            button_link=FRONTEND_BASE_URL,
            bottom_text=f"""С уважением, PeopleFLow""",
        )
    except EmailSendError as error:
        logger.error(
            f"Письмо о новых новостях не было отправлено на почты {subscribed_users_email_list}. Ошибка: {error}")
        return None

    return True
