import email
import email.mime.multipart
import logging
import os
import smtplib
import ssl
from email import encoders
from email.mime.base import MIMEBase
from email.mime.text import MIMEText

import requests
from jinja2 import Environment, FileSystemLoader, select_autoescape

from base.utils.exceptions import EmailError, EmailSendError
from settings.settings import EMAIL_HOST, EMAIL_PORT, EMAIL_ADDRESS, EMAIL_PASSWORD

logger = logging.getLogger(__name__)


class Email:
    """Отправить email"""

    def __init__(
            self,
            email_host=EMAIL_HOST,
            email_port=EMAIL_PORT,
            email_address=EMAIL_ADDRESS,
            email_password=EMAIL_PASSWORD
    ):

        self.email_host = email_host
        self.email_port = email_port
        self.email_address = email_address
        self.email_password = email_password

    def send_email(
            self,
            receivers: list[str],
            subject: str = '',
            text: str = None,
            html: str = None,
            attachments: list[dict] = None,
            carbon_copy: list[str] = None,
            blind_carbon_copy: list[str] = None
    ) -> bool:
        """
         Отправить email

        :param receivers: Список получателей
        :param carbon_copy: Список копий
        :param blind_carbon_copy: Список скрытых копий
        :param text: Текстовое представление письма
        :param html: HTML представление письма
        :param attachments: Список вложений
        :param subject: Тема письма

        :return: True - письмо отправлено, False - письмо не отправлено
        """

        all_receivers = []

        message = email.mime.multipart.MIMEMultipart("alternative")
        message["From"] = self.email_address
        message["Subject"] = subject
        message["To"] = ",".join(receivers)

        all_receivers.extend(receivers)

        if carbon_copy:
            message["CC"] = ','.join(carbon_copy)
            all_receivers.extend(carbon_copy)
        if blind_carbon_copy:
            all_receivers.extend(blind_carbon_copy)

        if not text and not html:
            raise EmailError("Должно быть заполнено одно из полей: text или html")

        if text:
            text_part = MIMEText(text, "plain")
            message.attach(text_part)
        if html:
            html_part = MIMEText(f"{html}", "html")
            message.attach(html_part)

        context = ssl.create_default_context()
        if attachments:
            # TODO добавить поддержку файлов и bytes
            for attachment in attachments:
                url = attachment.get('url')
                if not url:
                    continue
                temp_doc = requests.get(url, stream=True)
                filetype = temp_doc.headers['Content-Type']
                maintype, subtype = filetype.split('/')
                part = email.mime.base.MIMEBase(maintype, subtype, name=url.split("/")[-1])
                part.set_payload(temp_doc.content)
                email.encoders.encode_base64(part)
                part.add_header('Content-Disposition',
                                f'attachment; filename="{url.split("/")[-1]}"')
                message.attach(part)

        try:
            with smtplib.SMTP_SSL(self.email_host, self.email_port, context=context) as server:
                server.ehlo()
                server.login(self.email_address, self.email_password)
                server.auth_plain()
                server.sendmail(self.email_address, all_receivers, message.as_string())
            return True
        except Exception as e:
            raise EmailSendError(e)

    def send_email_with_button(
            self,
            receivers: list[str],
            subject: str,
            title: str,
            greeting: str,
            main_text: str,
            bottom_text: str,
            button_text: str,
            button_link: str,
            carbon_copy: list[str] = None,
            blind_carbon_copy: list[str] = None,
    ) -> bool:
        """
        Отправить email с кнопкой

        :param receivers: Список получателей
        :param subject: Тема письма
        :param title: Заголовок письма
        :param greeting: Приветствие
        :param main_text: Основной текст
        :param bottom_text: Текст внизу письма
        :param button_text: Текст кнопки
        :param button_link: Ссылка кнопки
        :param carbon_copy: Список копий
        :param blind_carbon_copy: Список скрытых копий
        :return: True - письмо отправлено, False - письмо не отправлено
        """
        env = Environment(loader=FileSystemLoader("base"), autoescape=select_autoescape())
        html = env.get_template('utils/email_button.html')
        logo_link = os.getenv('CORP_LOGO_LINK')

        content = {
            "TITLE": title,
            "GREETING": greeting,
            "MAIN_TEXT": main_text,
            "BOTTOM_TEXT": bottom_text,
            "BUTTON_TEXT": button_text,
            "BUTTON_LINK": button_link,
            "LOGO_LINK": logo_link,
        }
        html = html.render(**content)

        return self.send_email(
            receivers=receivers,
            carbon_copy=carbon_copy,
            blind_carbon_copy=blind_carbon_copy,
            subject=subject,
            text=main_text,
            html=html)
