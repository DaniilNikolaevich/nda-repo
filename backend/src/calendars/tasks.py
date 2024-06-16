import datetime
import logging

import arrow
import pytz
from celery import shared_task
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone

from base.utils.http import Response
from calendars.models import CalendarEvent, ExternalBooking
from users.models import User

logger = logging.getLogger(__name__)


def test(request, *args, **kwargs):
    return Response({"status": "ok+"})


@shared_task
def update_calendars():
    tz = pytz.timezone('Europe/Moscow')
    today = timezone.now().astimezone(tz)

    #  Находим всех рекрутеров для которых задан внешний календарь
    recruiters_with_external_calendar = User.objects.filter(
        admin_info__external_calendar_url__isnull=False,
        admin_info__external_calendar_type__isnull=False
    )

    for recruiter in recruiters_with_external_calendar:
        try:
            external_calendar = recruiter.admin_info.external_calendar
        except Exception as ex:
            logger.error(f"Не удалось получить внешний календарь для рекрутера {recruiter.id}: {ex}")
            continue
        # Если календарь не изменился, то пропускаем
        if not external_calendar.is_changed:
            continue

        # Удаляем все события внешнего календаря (которые еще не состоялись) для рекрутера
        external_calendar_events = recruiter.external_bookings.filter(end_datetime__gte=today)
        external_calendar_events.delete()

        # Получаем все актуальные события внешнего календаря
        events = external_calendar.get_recent_events()

        external_bookings = []
        for event in events:
            if event.all_day:
                start_datetime = arrow.get(f"{event.begin.date()} 00:00:00").replace(tzinfo='Europe/Moscow').datetime
                end_datetime = arrow.get(f"{event.end.date() - datetime.timedelta(days=1)} 23:59:59").replace(
                    tzinfo='Europe/Moscow').datetime
            else:
                start_datetime = event.begin.to('Europe/Moscow').datetime
                end_datetime = event.end.to('Europe/Moscow').datetime
                if end_datetime.time() == datetime.time.min:
                    end_datetime = end_datetime - datetime.timedelta(seconds=1)

            external_bookings.append(ExternalBooking(
                recruiter=recruiter,
                uid=event.uid,
                name=event.name,
                start_datetime=start_datetime,
                end_datetime=end_datetime,
            ))
        ExternalBooking.objects.bulk_create(external_bookings)

        # Обновляем хэш календаря
        recruiter.admin_info.external_calendar_hash = external_calendar.calculate_hash()
        recruiter.admin_info.save()

    return


@shared_task
def change_event_in_booking_calendar(event_id):
    """Изменение события в календаре бронирования."""
    try:
        event = CalendarEvent.objects.get(id=event_id)
    except ObjectDoesNotExist:
        logger.error(f"Бронирования {event_id} не существует")
        return False

    try:
        booking_calendar = event.recruiter.admin_info.booking_calendar
    except Exception as ex:
        logger.error(f"Не удалось получить календарь бронирования для рекрутера {event.recruiter}: {ex}")
        return False
    booking_calendar.update_booking_event(event)
    booking_calendar.save()
    return True


@shared_task
def add_event_to_booking_calendar(booking_id):
    """Добавление нового события в календарь бронирования."""
    try:
        booking = CalendarEvent.objects.get(id=booking_id)
    except ObjectDoesNotExist:
        logger.error(f"Бронирования {booking_id} не существует")
        return False
    try:
        booking_calendar = booking.recruiter.admin_info.booking_calendar
    except Exception as ex:
        logger.error(f"Не удалось получить календарь бронирования для рекрутера {booking.recruiter}: {ex}")
        return False
    booking_calendar.add_booking_event(booking)
    booking_calendar.save()
    return True
