import datetime
import logging

from dateutil.relativedelta import relativedelta
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from django.utils import timezone
from django.utils.decorators import method_decorator
from rest_framework import status
from rest_framework.views import APIView

from base.utils.decorators import log_action, tryexcept
from base.utils.exceptions import BadRequestException
from base.utils.http import Response
from base.utils.paginators import AbstractPaginator
from calendars.models import CalendarEvent, Schedule, SpecialDay
from calendars.serializers import AdminCalendarEventWriteSerializer, CalendarEventReadSerializer, \
    CalendarEventWriteSerializer, \
    GenerateTimeSlotsSerializer, ScheduleReadSerializer, ScheduleWriteSerializer, SpecialDayReadSerializer, \
    SpecialDayWriteSerializer
from users.decorators import auth
from users.models import User
from vacancies.models import Interview

logger = logging.getLogger(__name__)


# Create your views here.

@method_decorator([tryexcept, auth, log_action], name='dispatch')
class GenerateTimeSlots(APIView):

    def dispatch(self, request, *args, **kwargs):
        self.user = kwargs.get('user')
        if self.user.role not in [User.Role.RECRUITER, User.Role.ADMIN]:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        """Генерирует слоты для расписания."""
        serializer = GenerateTimeSlotsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        time_slots = serializer.save()
        return Response(status=status.HTTP_201_CREATED, content=time_slots)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class ScheduleView(APIView):
    recruiter = None

    def dispatch(self, request, *args, **kwargs):

        try:
            self.recruiter = User.objects.get(id=kwargs.get('recruiter_id'))
        except ObjectDoesNotExist:
            return Response(
                status=status.HTTP_404_NOT_FOUND,
                content='Рекрутер не найден'
            )
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        """Возвращает расписание для заданного рекрутера."""
        schedule = Schedule.objects.filter(recruiter=self.recruiter.id).order_by('weekday')
        serializer = ScheduleReadSerializer(schedule, many=True)
        return Response(status=status.HTTP_200_OK, content=serializer.data)

    def post(self, request, *args, **kwargs):
        """Создает новое расписание для заданного рекрутера."""
        self.user = kwargs.get('user')
        if self.user.role not in [User.Role.RECRUITER, User.Role.ADMIN]:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')
        for item in request.data:
            item['recruiter'] = self.recruiter.id
        serializer = ScheduleWriteSerializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            instances = serializer.save()
        return Response(
            status=status.HTTP_201_CREATED,
            content=ScheduleReadSerializer(instances, many=True).data
        )

    def put(self, request, *args, **kwargs):
        with transaction.atomic():
            for item in request.data:
                try:
                    schedule = Schedule.objects.get(weekday=item.get('weekday'), recruiter=self.recruiter.id)
                except (ObjectDoesNotExist, ValueError):
                    continue
                item['recruiter'] = self.recruiter.id
                serializer = ScheduleWriteSerializer(data=item, instance=schedule)
                serializer.is_valid(raise_exception=True)
                serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def delete(self, request, *args, **kwargs):
        schedules = Schedule.objects.filter(recruiter=self.recruiter.id)
        schedules.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class ScheduleDetailView(APIView):
    recruiter = None
    schedule = None

    def dispatch(self, request, *args, **kwargs):
        try:
            self.recruiter = User.objects.get(id=kwargs.get('recruiter_id'))
        except ObjectDoesNotExist:
            return Response(
                status=status.HTTP_404_NOT_FOUND,
                content='Рекрутер не найден'
            )

        try:
            self.schedule = Schedule.objects.get(
                id=kwargs.get('schedule_id'),
                recruiter=self.recruiter.id

            )
        except ObjectDoesNotExist:
            return Response(
                status=status.HTTP_404_NOT_FOUND,
                content='Расписание не найдено'
            )

        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        return Response(
            status=status.HTTP_200_OK,
            content=ScheduleReadSerializer(self.schedule).data
        )

    def put(self, request, *args, **kwargs):
        request.data['recruiter'] = self.recruiter.id
        serializer = ScheduleWriteSerializer(data=request.data, instance=self.schedule)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def delete(self, request, *args, **kwargs):
        self.schedule.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class SpecialDayView(APIView):
    recruiter = None

    def dispatch(self, request, *args, **kwargs):
        try:
            self.recruiter = User.objects.get(id=kwargs.get('recruiter_id'))
        except ObjectDoesNotExist:
            return Response(
                status=status.HTTP_404_NOT_FOUND,
                content='Рекрутер не найден'
            )
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        special_days = SpecialDay.objects.filter(recruiter=self.recruiter.id).order_by('date')
        print(special_days)
        serializer = SpecialDayReadSerializer(special_days, many=True)
        return Response(
            status=status.HTTP_200_OK,
            content=serializer.data
        )

    def post(self, request, *args, **kwargs):
        request.data['recruiter'] = self.recruiter.id
        serializer = SpecialDayWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return Response(
            status=status.HTTP_201_CREATED,
            content=SpecialDayReadSerializer(instance).data
        )


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class SpecialDayDetailView(APIView):
    recruiter = None
    special_day = None

    def dispatch(self, request, *args, **kwargs):
        try:
            self.recruiter = User.objects.get(id=kwargs.get('recruiter_id'))
        except ObjectDoesNotExist:
            return Response(
                status=status.HTTP_404_NOT_FOUND, content='Рекрутер не найден'
            )

        try:
            self.special_day = SpecialDay.objects.get(
                id=kwargs.get('special_day_id'),
                recruiter=self.recruiter.id
            )
        except ObjectDoesNotExist:
            return Response(
                status=status.HTTP_404_NOT_FOUND,
                content='День исключение не найден'
            )

        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        return Response(
            status=status.HTTP_200_OK,
            content=SpecialDayReadSerializer(self.special_day).data
        )

    def put(self, request, *args, **kwargs):
        request.data['recruiter'] = self.recruiter.id
        serializer = SpecialDayWriteSerializer(data=request.data, instance=self.special_day)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def delete(self, request, *args, **kwargs):
        self.special_day.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class AvailableTimeSlotsView(APIView):
    interview = None

    def dispatch(self, request, *args, **kwargs):
        interview_id = kwargs.get('interview_id')
        try:
            self.interview = Interview.objects.get(id=interview_id)
        except ObjectDoesNotExist:
            return Response(
                status=status.HTTP_404_NOT_FOUND,
                content='Рекрутер не найден'
            )

        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        """Получить доступные слоты для бронирования для заданного рекрутера."""
        date = request.GET.get('date')
        if not date:
            return Response(
                status=status.HTTP_400_BAD_REQUEST,
                content='Укажите дату'
            )
        date = datetime.datetime.strptime(date, "%Y-%m-%d").date()
        if date < timezone.now().date():
            return Response(
                status=status.HTTP_400_BAD_REQUEST,
                content='Выберите текущую или будущую дату'
            )
        available_time_slots = self.interview.recruiter_flow.vacancy.responsible_recruiter.get_available_slots(date)
        return Response(content=available_time_slots)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class AvailableDatesView(APIView):
    interview = None

    def dispatch(self, request, *args, **kwargs):
        interview_id = kwargs.get('interview_id')
        try:
            self.interview = Interview.objects.get(id=interview_id)
        except ObjectDoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND, content='Интервью не найдено')

        return super().dispatch(request, *args, **kwargs)

    @staticmethod
    def get_dates_for_month(year, month):
        """
        Generate a list of dates for the entire month.
        """
        # Start with the first day of the month
        current_date = datetime.date(year, month, 1)
        now = timezone.localtime(timezone.now(), timezone=timezone.get_current_timezone())
        if year == now.year and month == now.month:
            current_date = now.date()

        dates = []

        # Add dates until the next month is reached
        while current_date.month == month:
            dates.append(current_date)
            current_date += datetime.timedelta(days=1)

        return dates

    def get(self, request, *args, **kwargs):
        """Получить доступные даты для бронирования рекрутера."""

        month = request.GET.get('month')
        year = request.GET.get('year')
        date_strings = request.GET.getlist('date')
        date_format = "%m-%Y"

        if month and year:
            try:
                month = int(month)
            except ValueError:
                return Response(
                    status=status.HTTP_400_BAD_REQUEST,
                    content='Неверный формат месяца'
                )
            if month not in [i for i in range(1, 13)]:
                return Response(
                    status=status.HTTP_400_BAD_REQUEST,
                    content='Неверный формат месяца'
                )

            if not year:
                return Response(
                    status=status.HTTP_400_BAD_REQUEST,
                    content='Укажите год'
                )
            if len(year) != 4:
                return Response(
                    status=status.HTTP_400_BAD_REQUEST,
                    content='Неверный формат года'
                )
            try:
                year = int(year)
            except ValueError:
                return Response(
                    status=status.HTTP_400_BAD_REQUEST,
                    content='Неверный формат года'
                )
            if year < timezone.now().year:
                return Response(
                    status=status.HTTP_400_BAD_REQUEST,
                    content='Нельзя выбрать прошедший год'
                )

            if year == timezone.now().year and month == timezone.now().month:
                start_date = datetime.datetime.today()
            else:
                start_date = datetime.datetime.strptime(f"{year}-{month}", "%Y-%m")

            # Get the last day of the current month
            end_date = start_date + relativedelta(day=31)

            # Generate list of dates from start_date to end_date
            dates = [(start_date + datetime.timedelta(days=i)).date() for i in range((end_date - start_date).days + 1)]

            available_dates = self.interview.recruiter_flow.vacancy.responsible_recruiter.get_available_dates(dates)
        elif date_strings:

            all_dates = []

            for date_str in date_strings:
                try:
                    date_obj = datetime.datetime.strptime(date_str, date_format).date()
                    month_dates = self.get_dates_for_month(date_obj.year, date_obj.month)
                    all_dates.extend(month_dates)
                except ValueError as exc:
                    logger.error(
                        f'Ошибка при попытке получения доступных дат для бронирования рекрутера: {exc}')
                    return Response(
                        status=status.HTTP_400_BAD_REQUEST,
                        content='Указан неверный формат даты'
                    )

            available_dates = self.interview.recruiter_flow.vacancy.responsible_recruiter.get_available_dates(all_dates)
        else:
            return Response(
                status=status.HTTP_400_BAD_REQUEST,
                content='Не указаны ключи date или month, year'
            )
        true_dates = [date for date, value in available_dates.items() if value]
        return Response(content=true_dates)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class UserBookingView(APIView):
    recruiter = None
    site = None

    def dispatch(self, request, *args, **kwargs):
        recruiter_id = kwargs.get('recruiter_id')
        if recruiter_id:
            try:
                self.recruiter = User.objects.get(id=recruiter_id, role=User.Role.RECRUITER)
            except ObjectDoesNotExist:
                return Response(
                    status=status.HTTP_404_NOT_FOUND,
                    content='Рекрутер не найден'
                )
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, user, *args, **kwargs):
        booked_slots = CalendarEvent.objects.filter(candidate=user)
        try:
            paginator = AbstractPaginator(
                model=CalendarEvent,
                model_serializer=CalendarEventReadSerializer,
                queryset=booked_slots,
                context={"kwargs": kwargs},
                request=request
            )
            result = paginator.get_result(
                search_list=['name__icontains', 'description__icontains']
            )
        except BadRequestException as error:
            return Response(
                status=status.HTTP_400_BAD_REQUEST,
                content=error.message
            )
        return Response(result)

    def post(self, request, *args, **kwargs):
        """
        Создание бронирования.
        Бронирование может быть создано по временным слотам в рамках одного дня
        """
        request.data['recruiter'] = self.recruiter.id
        serializer = CalendarEventWriteSerializer(data=request.data, context={'candidate': kwargs.get('user')})
        serializer.is_valid(raise_exception=True)
        serializer.save(
            candidate=kwargs.get('user'),
            recruiter=self.recruiter,
        )

        return Response(
            status=status.HTTP_201_CREATED,
        )


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class AdminBookingView(APIView):
    user = None

    def dispatch(self, request, *args, **kwargs):
        self.user = kwargs.get('user')
        if not self.user.is_admin and not self.user.is_recruiter:
            return Response(
                status=status.HTTP_403_FORBIDDEN,
                content='Доступ запрещен'
            )
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, user, *args, **kwargs):
        """Получение списка бронирований для рекрутера"""
        booked_slots = CalendarEvent.objects.filter(recruiter=self.user)
        try:
            paginator = AbstractPaginator(CalendarEvent, CalendarEventReadSerializer, booked_slots,
                                          context={"kwargs": kwargs}, request=request)
            result = paginator.get_result(
                search_list=[
                    'name__icontains', 'description__icontains', 'meeting_url__icontains'],
            )
        except BadRequestException as error:
            return Response(
                status=status.HTTP_400_BAD_REQUEST,
                content=error.message
            )
        return Response(result)

    def post(self, request, *args, **kwargs):
        """
        Создание бронирования.
        Бронирование может быть создано по временным слотам в рамках одного дня
        """
        request.data['recruiter'] = kwargs.get('user')
        serializer = AdminCalendarEventWriteSerializer(data=request.data, context={'recruiter': kwargs.get('user')})
        serializer.is_valid(raise_exception=True)
        serializer.save(recruiter=kwargs.get('user'))
        return Response(
            status=status.HTTP_201_CREATED,
        )


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class AdminBookingDetailView(APIView):

    def get(self, request, *args, **kwargs):
        try:
            event = CalendarEvent.objects.get(id=kwargs.get('event_id'))
        except ObjectDoesNotExist:
            return Response(
                status=status.HTTP_404_NOT_FOUND,
                content='Событие не найдено'
            )
        serializer = CalendarEventReadSerializer(event)
        return Response(
            status=status.HTTP_200_OK,
            content=serializer.data
        )

    def put(self, request, *args, **kwargs):
        try:
            event = CalendarEvent.objects.get(id=kwargs.get('event_id'))
        except ObjectDoesNotExist:
            return Response(
                status=status.HTTP_404_NOT_FOUND,
                content='Событие не найдено'
            )

        serializer = AdminCalendarEventWriteSerializer(data=request.data, instance=event, partial=True,
                                                       context={'recruiter': event.recruiter})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def delete(self, request, *args, **kwargs):
        try:
            event = CalendarEvent.objects.get(id=kwargs.get('event_id'))
        except ObjectDoesNotExist:
            return Response(
                status=status.HTTP_404_NOT_FOUND,
                content='Событие не найдено'
            )
        event.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
