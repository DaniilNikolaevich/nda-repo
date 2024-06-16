import hashlib
import io
import logging
import re
import traceback
import uuid
from datetime import datetime, time, timedelta

import pytz
import requests
from django.utils import timezone
from ics import Calendar, Event

from base.utils.exceptions import S3ConnectionError, S3UploadError
from base.utils.files import S3Wrapper
from base.utils.notification import telegram_message
from calendars.exceptions import ExternalCalendarNotSet
from calendars.models import CalendarEvent
from settings.settings import S3_CALENDARS_BUCKET, S3_SERVER
from users.models import CalendarType, User

logger = logging.getLogger(__name__)


class ExternalBookingCalendar:
    def __init__(self, user: User):
        self.user = user
        self.calendar = self.__get_calendar(user)

    def __get_calendar(self, user: User) -> Calendar:
        calendar_url = user.admin_info.external_calendar_url
        calendar_type = user.admin_info.external_calendar_type
        if calendar_url is None:
            raise ExternalCalendarNotSet
        response = requests.get(calendar_url)
        response.raise_for_status()
        calendar_data = response.text
        if calendar_type == CalendarType.APPLE:
            calendar_data = self.__fix_apple_calendar(calendar_data)
        elif calendar_type == CalendarType.BITRIX:
            calendar_data = self.__fix_bitrix_calendar(calendar_data)
        return Calendar(calendar_data)

    @property
    def is_changed(self):
        return hashlib.md5(
            str(self.calendar.events).encode('utf-8')).hexdigest() != self.user.admin_info.external_calendar_hash

    def calculate_hash(self):
        return hashlib.md5(str(self.calendar.events).encode('utf-8')).hexdigest()

    @staticmethod
    def __fix_apple_calendar(calendar_data: str):
        PRODID = 'PRODID: Apple Calendars'
        BEGIN = 'BEGIN:VCALENDAR'

        if 'PRODID' not in calendar_data:
            start = calendar_data.find(BEGIN)
            calendar_data = calendar_data[:start + len(BEGIN)] + '\n' + PRODID + calendar_data[start + len(BEGIN):]

        return calendar_data

    @staticmethod
    def __fix_bitrix_calendar(calendar_data: str):
        calendar_data = calendar_data.replace(';VALUE=DATE-TIME', '')  # remove incorrect date-time value designator
        calendar_data = re.sub(r'(DTSTAMP:\d{8}T\d{6})\d+', r'\1Z', calendar_data)  # correct DTSTAMP fields
        return calendar_data

    def get_recent_events(self):

        events = []

        moscow_tz = pytz.timezone('Europe/Moscow')
        today = timezone.now().astimezone(moscow_tz)

        for event in self.calendar.events:
            # Пропускаем события, которые закончились раньше текущего дня
            if event.end < today:
                continue

            # # Get start and end of the event
            # start = event.begin.date() if event.all_day else event.begin.astimezone(moscow_tz)
            # end = event.end.date() if event.all_day else event.end.astimezone(moscow_tz)

            events.append(event)

        return sorted(events, key=lambda x: x.begin)


class BookingCalendar:

    def __init__(self, user: User):
        self.user = user
        self.calendar, self.calendar_id = self.__get_calendar()

    def __get_calendar(self):
        """Метод возвращает календарь и его идентификатор, если календарь имеется, иначе создает такой календарь."""
        if self.user.admin_info.calendar_data:
            calendar_data = self.user.admin_info.calendar_data
            return Calendar(calendar_data['data']), calendar_data['id']
        else:
            return self.create_booking_calendar(self.user)

    def get_calendar_url(self):
        """Метод возвращает ссылку на календарь."""
        return f"https://{S3_CALENDARS_BUCKET}.{S3_SERVER.replace('https://', '')}/{self.calendar_id}.ics"

    @staticmethod
    def get_booking_event_name(event: CalendarEvent) -> str:
        """Метод возвращает название события бронирования."""
        return f"Событие '{event.candidate.fullname}' [{event.name}]"

    @staticmethod
    def get_booking_event_description(event: CalendarEvent) -> str:
        """Метод возвращает описание события бронирования."""
        return f"ФИО соискателя: {event.candidate.fullname}.\n" \
               f"Телефон рекрутера: +{event.recruiter.admin_info.phone} \n" \
               f"Email рекрутера: {event.recruiter.admin_info.email} \n"

    def add_booking_event(self, calendar_event: CalendarEvent) -> None:
        """Метод добавляет событие бронирования в календарь."""
        tz = pytz.timezone('Europe/Moscow')
        # Бронирования по сессиям в рамках одного дня
        booking_slots = calendar_event.booking_slots.all().values('id', 'start_time', 'end_time')
        for booking_slot in booking_slots:
            # Create an event
            event = Event()
            event.name = self.get_booking_event_name(calendar_event)
            event.description = self.get_booking_event_description(calendar_event)
            event.begin = tz.localize(datetime.combine(calendar_event.start_date, booking_slot['start_time']))
            event.end = tz.localize(datetime.combine(calendar_event.start_date, booking_slot['end_time']))
            event.uid = f"{calendar_event.id}_{booking_slot['id']}"
            # Add the event to the calendar
            self.calendar.events.add(event)

    def update_booking_event(self, calendar_event: CalendarEvent) -> None:
        """Метод обновляет событие бронирования в календаре."""
        events = self.calendar.events.copy()
        for event in events:
            if event.uid[:36] == str(calendar_event.id):
                # delete event
                self.calendar.events.remove(event)
        self.add_booking_event(calendar_event)

    def upload_calendar_to_s3(self) -> None:
        """Метод загружает календарь в S3."""
        return self._upload_calendar_to_s3(self.calendar, self.calendar_id)

    @staticmethod
    def _upload_calendar_to_s3(calendar: Calendar, calendar_id: str) -> None:
        """Приватный метод для загрузки календаря в S3."""
        file_content = io.BytesIO()
        file_content.write(str(calendar).encode())
        file_content.seek(0)
        file_name = f"{calendar_id}.ics"
        try:
            s3 = S3Wrapper(bucket_name=S3_CALENDARS_BUCKET)
            s3.upload_file(file_name, file_content)
        except (S3UploadError, S3ConnectionError):
            telegram_message(traceback.format_exc())
            logger.error(traceback.format_exc())
            raise S3UploadError

        return None

    @classmethod
    def create_booking_calendar(cls, user: User) -> (Calendar, str):
        """Создание календаря бронирования для территории."""

        calendar = Calendar()
        calendar.creator = 'PeopleFlow Recruiter Calendar | peopleflow.ru'
        calendar_id = str(uuid.uuid4())

        cls._upload_calendar_to_s3(calendar, calendar_id)

        user.admin_info.calendar_data = {
            "id": str(calendar_id),
            "data": calendar.serialize()
        }
        user.admin_info.save()
        return calendar, calendar_id

    def save(self) -> None:
        """Сохранение календаря в БД и на S3."""
        self.upload_calendar_to_s3()
        self.user.admin_info.calendar_data = {
            "id": str(self.calendar_id),
            "data": self.calendar.serialize()
        }
        self.user.admin_info.save()
        return None


def generate_slots(existing_external_bookings_dict: dict, start_datetime: datetime, end_datetime: datetime) -> dict:
    moscow_tz = pytz.timezone('Europe/Moscow')

    # Adjust the datetimes to Moscow Time Zone only if they are naive
    if start_datetime.tzinfo is None:
        start_datetime = moscow_tz.localize(start_datetime)
    else:
        start_datetime = start_datetime.astimezone(moscow_tz)

    if end_datetime.tzinfo is None:
        end_datetime = moscow_tz.localize(end_datetime)
    else:
        end_datetime = end_datetime.astimezone(moscow_tz)

    current_date = start_datetime.date()
    end_date = end_datetime.date()

    while current_date <= end_date:
        # If it's the starting date, begin from the provided time, otherwise start at the beginning of the day
        start_time = start_datetime.time() if current_date == start_datetime.date() else time(0, 0)

        # If it's the ending date, end at the provided time, otherwise end at the end of the day
        end_time = end_datetime.time() if current_date == end_datetime.date() else time(23, 59, 59)

        if current_date in existing_external_bookings_dict:
            existing_external_bookings_dict[current_date].append({
                "start_time": start_time,
                "end_time": end_time
            })
        else:
            existing_external_bookings_dict[current_date] = [{
                "start_time": start_time,
                "end_time": end_time
            }]

        current_date += timedelta(days=1)

    return existing_external_bookings_dict


def is_slot_overlapped(slot, booking):
    """Checks if a booking fully or partially overlaps a slot."""
    return booking['start_time'] <= slot['end_time'] and booking['end_time'] >= slot['start_time']


def generate_time_slots(start_time, end_time, session_duration, gap_duration):
    """Сгенерировать временные слоты для расписания."""
    # Check if start_time and end_time are strings and convert them to datetime objects if so
    if isinstance(start_time, str):
        start_time = datetime.strptime(start_time, "%H:%M:%S").time()
    if isinstance(end_time, str):
        end_time = datetime.strptime(end_time, "%H:%M:%S").time()

    # Convert time objects to datetime to do calculations
    start_time_dt = datetime.combine(datetime.today(), start_time)
    end_time_dt = datetime.combine(datetime.today(), end_time)

    # Initialize slots list
    schedule_slots = []

    # While start_time is less than end_time
    while start_time_dt < end_time_dt:
        # Calculate end of session based on session_duration
        session_end_dt = start_time_dt + timedelta(minutes=session_duration)
        # If session end is beyond end_time, break the loop
        if session_end_dt > end_time_dt:
            break

        # Add session to schedule_slots
        schedule_slots.append({
            'start_time': start_time_dt.time().isoformat(),
            'end_time': session_end_dt.time().isoformat()
        })

        # Update start_time for the next session based on gap_duration
        start_time_dt = session_end_dt + timedelta(minutes=gap_duration)

    return schedule_slots


def are_slots_overlapping(slots: list[dict]):
    """Проверка, что временные слоты не пересекаются."""
    slots = sorted(slots, key=lambda x: x['start_time'])  # Sorting by start_time

    for i in range(len(slots) - 1):
        current_end_time = slots[i]['end_time']
        next_start_time = slots[i + 1]['start_time']

        if current_end_time > next_start_time:
            return True

    return False


def candidate_create_event_booking(recruiter_id: str | uuid.UUID,
                                   candidate_id: str | uuid.UUID,
                                   name: str,
                                   description: str,
                                   slots: list[uuid.UUID],
                                   start_date: str,
                                   end_date: str,
                                   meeting_url: str) -> (bool, str | CalendarEvent):
    data = {
        "recruiter": recruiter_id,
        "candidate": candidate_id,
        "name": name,
        "description": description,
        "start_date": start_date,
        "end_date": end_date,
        "meeting_url": meeting_url,
        "slots": slots
    }
    try:
        candidate = User.objects.get(id=candidate_id)
        recruiter = User.objects.get(id=recruiter_id)
    except User.DoesNotExist:
        return False, "Кандидат не найден"

    from calendars.serializers import CalendarEventWriteSerializer
    serializer = CalendarEventWriteSerializer(data=data, context={'candidate': candidate})
    serializer.is_valid(raise_exception=True)
    instance = serializer.save(
        candidate=candidate,
        recruiter=recruiter,
    )
    return True, instance
