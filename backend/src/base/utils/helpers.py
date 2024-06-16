import datetime
import decimal
import json
import logging
import uuid

import phonenumbers
from django.core.exceptions import ImproperlyConfigured
from django.db import connection, OperationalError
from django.utils import timezone
from django.utils.duration import duration_iso_string
from django.utils.functional import Promise
from django.utils.timezone import localtime, is_aware
from phonenumbers.phonenumberutil import NumberParseException

logger = logging.getLogger(__name__)


def is_valid_uuid(value):
    try:
        uuid.UUID(str(value))
        return True
    except ValueError:
        return False


def get_ids_from_query_param(request, param_name, expected_type):
    param_value = request.GET.get(param_name)
    if param_value:
        if expected_type == 'int':
            ids_list = [int(id) for id in param_value.split(',') if id.isdigit()]
        elif expected_type == 'uuid':
            ids_list = [id for id in param_value.split(',') if is_valid_uuid(id)]
        else:
            raise ValueError(f"Unsupported expected_type: {expected_type}")
    else:
        ids_list = None
    return ids_list


class CustomDjangoJSONEncoder(json.JSONEncoder):
    """
    JSONEncoder subclass that knows how to encode date/time, decimal types, and
    UUIDs.
    """

    def default(self, o):
        # See "Date Time String Format" in the ECMA-262 specification.
        if isinstance(o, datetime.datetime):
            r = localtime(o).isoformat()
            if o.microsecond:
                r = r[:23] + r[26:]
            if r.endswith('+00:00'):
                r = r[:-6] + 'Z'
            return r
        elif isinstance(o, datetime.date):
            return localtime(o).isoformat()
        elif isinstance(o, datetime.time):
            if is_aware(o):
                raise ValueError("JSON can't represent timezone-aware times.")
            r = o.isoformat()
            if o.microsecond:
                r = r[:12]
            return r
        elif isinstance(o, datetime.timedelta):
            return duration_iso_string(o)
        elif isinstance(o, (decimal.Decimal, uuid.UUID, Promise)):
            return str(o)
        else:
            return super().default(o)


def check_database_connected() -> (bool, str | Exception | None):
    """
    Проверка подключения к базе данных
    :return: (True, None) если подключение установлено, (False, str | Exception) если подключение не установлено
    """

    try:
        connection.ensure_connection()
    except (ImproperlyConfigured, OperationalError) as error:
        return False, error
    else:
        if not connection.is_usable():
            return False, f"Подключение к базе данных не установлено."

    return True, None


def is_date(value):
    """Проверка на дату."""
    for fmt in ('%d.%m.%Y', '%d-%m-%Y', '%Y-%m-%d', '%Y/%m/%d', '%d/%m/%Y'):
        try:
            return True, datetime.datetime.strptime(value, fmt)
        except ValueError:
            pass
    return False, value


def is_datetime(value):
    """Checks if the value is a valid datetime string and converts to Moscow Time Zone

    Args:
    value (str): The datetime string to be checked.

    Returns:
    (bool, datetime or None): Tuple where the first element is a boolean indicating success,
                              and the second element is the converted datetime object or None.
    """
    moscow_tz = timezone.get_default_timezone()  # Assuming 'Europe/Moscow' is set as TIME_ZONE in Django settings
    formats = [
        '%d.%m.%Y %H:%M:%S%z',  # 31.12.2023 10:00:00+03:00
        '%d-%m-%Y %H:%M:%S%z',  # 31-12-2023 10:00:00+03:00
        '%d/%m/%Y %H:%M:%S%z',  # 31/12/2023 10:00:00+03:00

        '%d.%m.%Y %H:%M:%S',  # 31.12.2023 10:00:00
        '%d-%m-%Y %H:%M:%S',  # 31-12-2023 10:00:00
        '%d/%m/%Y %H:%M:%S',  # 31/12/2023 10:00:00

    ]
    for fmt in formats:
        try:
            parsed_date = datetime.datetime.strptime(value, fmt)
            # Convert naive datetime to aware datetime
            if timezone.is_naive(parsed_date):
                # Make it timezone aware with default timezone (Moscow)
                parsed_date = timezone.make_aware(parsed_date, moscow_tz)
            else:
                # Convert to default timezone (Moscow) if already timezone aware
                parsed_date = timezone.localtime(parsed_date, moscow_tz)

            return True, parsed_date
        except ValueError:
            pass
    return False, value


def is_valid_phone(phone: str) -> tuple[bool, None] | tuple[bool, str]:
    """
    The function takes a phone number string, validates it, and returns a valid value or False
    if the phone number is not in international format.

    :param phone: Phone number string in international format (with +)
    :return: Validation response (True/False), Validated phone number or None
    """
    # Ensure the phone number starts with a '+' for international format
    if not phone.startswith('+'):
        return False, None

    try:
        phone = phonenumbers.parse(phone, None)
    except NumberParseException:
        return False, None

    if phonenumbers.is_possible_number(phone) and phonenumbers.is_valid_number(phone):
        formatted_number = phonenumbers.format_number(phone, phonenumbers.PhoneNumberFormat.E164)
        return True, formatted_number

    return False, None


def parse_full_name(full_name, return_dict=False):
    """
    Разбивает ФИО на имя, фамилию и отчество.

    Parameters:
    full_name (str): Полное имя в формате "Фамилия Имя Отчество"

    Returns:
    dict: Словарь с ключами 'surname', 'name', 'patronymic'.
    """
    parts = full_name.split()
    if len(parts) == 1:
        name = parts[0]
        surname = patronymic = None
    if len(parts) == 3:
        surname, name, patronymic = parts
    elif len(parts) == 2:
        surname, name = parts
        patronymic = None
    elif len(parts) > 3:
        surname = parts[0]
        name = parts[1]
        patronymic = ' '.join(parts[2:])

    return {
        'surname': surname,
        'name': name,
        'patronymic': patronymic
    } if return_dict else (surname, name, patronymic)
