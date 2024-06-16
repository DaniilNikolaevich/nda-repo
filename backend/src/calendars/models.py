import uuid

from django.db import models

from base.models import BaseModel


# Create your models here.

class Schedule(BaseModel):
    """Расписание работы рекрутера."""

    class Weekday(models.IntegerChoices):
        MONDAY = 0, 'Понедельник'
        TUESDAY = 1, 'Вторник'
        WEDNESDAY = 2, 'Среда'
        THURSDAY = 3, 'Четверг'
        FRIDAY = 4, 'Пятница'
        SATURDAY = 5, 'Суббота'
        SUNDAY = 6, 'Воскресенье'

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    recruiter = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        verbose_name="Рекрутер",
        related_name="schedules"
    )

    weekday = models.IntegerField(
        choices=Weekday.choices,
        verbose_name="День недели"
    )

    is_day_off = models.BooleanField(
        default=False,
        verbose_name="Выходной?"
    )

    def __str__(self):
        return f"{self.recruiter.id} {self.recruiter.fullname} {self.get_weekday_display()}"

    class Meta:
        verbose_name = "Расписание работы рекрутера"
        verbose_name_plural = "Расписание работы рекрутеров"
        ordering = ['-created_at']
        # unique_together = ['recruiter', 'weekday']


class ScheduleSlot(BaseModel):
    """Доступные слоты Рекрутера"""

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    schedule = models.ForeignKey(
        'calendars.Schedule',
        on_delete=models.CASCADE,
        verbose_name="Расписание",
        related_name="schedule_slots"
    )

    start_time = models.TimeField(
        verbose_name="Время начала"
    )

    end_time = models.TimeField(
        verbose_name="Время окончания"
    )

    def __str__(self):
        return f"{self.schedule.recruiter.fullname}. {self.schedule.weekday} c {self.start_time} по {self.end_time}"

    class Meta:
        verbose_name = "Временной слот"
        verbose_name_plural = "Временные слоты"
        ordering = ['-created_at']
        unique_together = ['schedule', 'start_time', 'end_time']


class SpecialDay(BaseModel):
    """Специальный день с измененным расписанием."""

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    recruiter = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        verbose_name="Рекрутер",
        related_name="special_days"
    )
    date = models.DateField(
        verbose_name="Дата"
    )
    is_day_off = models.BooleanField(
        default=False,
        verbose_name="Выходной?"
    )

    def __str__(self):
        return f"{self.recruiter.fullname} - {self.date}"

    class Meta:
        verbose_name = "Специальный день"
        verbose_name_plural = "Специальные дни"
        ordering = ['-created_at']
        unique_together = ['recruiter', 'date']


class SpecialDaySlot(BaseModel):
    """Доступные слоты рекрутера в специальные дни."""

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    special_day = models.ForeignKey(
        'calendars.SpecialDay',
        on_delete=models.CASCADE,
        verbose_name="Специальный день",
        related_name="special_day_slots"
    )

    start_time = models.TimeField(
        verbose_name="Время начала"
    )

    end_time = models.TimeField(
        verbose_name="Время окончания"
    )

    def __str__(self):
        return f"{self.special_day.recruiter.fullname}. {self.special_day.date} c {self.start_time} по {self.end_time}"

    class Meta:
        verbose_name = "Временной слот специального дня"
        verbose_name_plural = "Временные слоты специальных дней"
        ordering = ['-created_at']
        unique_together = ['special_day', 'start_time', 'end_time']


class ExternalBooking(BaseModel):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    recruiter = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        verbose_name="Рекрутер",
        related_name="external_bookings"
    )
    uid = models.CharField(
        max_length=1024,
        verbose_name="UID события",
        null=True,
        blank=True
    )
    name = models.CharField(
        max_length=1024,
        verbose_name="Название события",
        null=True,
        blank=True
    )
    start_datetime = models.DateTimeField(
        verbose_name="Дата и время начала"
    )
    end_datetime = models.DateTimeField(
        verbose_name="Дата и время окончания"
    )

    class Meta:
        verbose_name = "Внешнее бронирования"
        verbose_name_plural = "Внешние бронирования"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.recruiter.fullname} - {self.name} - {self.start_datetime} - {self.end_datetime}"


class CalendarEvent(BaseModel):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    recruiter = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        verbose_name="Рекрутер",
        related_name="events_recruiter"
    )
    candidate = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        verbose_name="Кандидат",
        related_name="events_candidate"
    )
    uid = models.CharField(
        max_length=1024,
        verbose_name="UID события",
        null=True,
        blank=True
    )
    name = models.CharField(
        max_length=1024,
        verbose_name="Название события",
        null=True,
        blank=True
    )
    description = models.TextField(
        verbose_name="Описание события",
        null=True,
        blank=True
    )
    meeting_url = models.URLField(
        verbose_name="Ссылка на встречу",
        null=True,
        blank=True
    )
    interview = models.ForeignKey(
        'vacancies.Interview',
        on_delete=models.CASCADE,
        verbose_name="Собеседование",
        related_name="events",
        null=True,
        blank=True
    )
    start_date = models.DateField(
        verbose_name="Дата начала"
    )
    end_date = models.DateField(
        verbose_name="Дата окончания"
    )

    class Meta:
        verbose_name = "Событие"
        verbose_name_plural = "События"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.recruiter.fullname} - {self.name} - {self.start_date} - {self.end_date}"


class EventSlot(BaseModel):
    """Забронированные слоты."""
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    event = models.ForeignKey(
        CalendarEvent,
        on_delete=models.CASCADE,
        verbose_name="Событие",
        related_name="booking_slots"
    )
    start_time = models.TimeField(
        verbose_name="Время начала"
    )
    end_time = models.TimeField(
        verbose_name="Время окончания"
    )

    class Meta:
        verbose_name = "Забронированный слот"
        verbose_name_plural = "Забронированные слоты"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.event.name} - - {self.event.start_date} с {self.start_time} по {self.end_time}"
