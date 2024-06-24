import datetime

from django.db import transaction
from django.utils import timezone
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from base.serializers import BaseModelSerializer
from calendars.models import CalendarEvent, EventSlot, Schedule, ScheduleSlot, SpecialDay, SpecialDaySlot
from calendars.services import are_slots_overlapping, generate_time_slots
from users.admin_settings.serializers import ReadRecruiterSerializer
from users.serializer import CandidateSerializer
from vacancies.serializers import InterviewSerializer


class ScheduleSlotSerializer(BaseModelSerializer):
    class Meta:
        model = ScheduleSlot
        fields = ['id', 'start_time', 'end_time']
        extra_kwargs = {
            'id': {
                'read_only': False,
                'required': False,
                'allow_null': True
            }
        }

    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise ValidationError("Время начала интервала должно быть меньше времени окончания интервала")
        return data


class GenerateTimeSlotsSerializer(serializers.Serializer):
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    session_duration = serializers.IntegerField(min_value=0, max_value=60 * 24)
    gap_duration = serializers.IntegerField(min_value=0, max_value=60 * 23)

    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise ValidationError("Время начала интервала должно быть меньше времени окончания интервала")
        return data

    def create(self, validated_data):
        start_time = validated_data['start_time']
        end_time = validated_data['end_time']
        session_duration = validated_data['session_duration']
        gap_duration = validated_data['gap_duration']
        return generate_time_slots(start_time, end_time, session_duration, gap_duration)


class ScheduleReadSerializer(BaseModelSerializer):
    schedule_slots = serializers.SerializerMethodField()
    weekday = serializers.SerializerMethodField()

    class Meta:
        model = Schedule
        fields = ('id', 'weekday', 'schedule_slots', 'is_day_off')

    def get_schedule_slots(self, obj):
        if obj.is_day_off:
            return None
        slots = obj.schedule_slots.order_by('start_time')  # Сортируем временные слоты по времени начала
        return ScheduleSlotSerializer(slots, many=True).data

    def get_weekday(self, obj):
        return {
            "id": obj.weekday,
            "name": obj.get_weekday_display()
        }


class ScheduleWriteSerializer(BaseModelSerializer):
    schedule_slots = ScheduleSlotSerializer(many=True, required=False, allow_null=False)

    class Meta:
        model = Schedule
        fields = ['id', 'recruiter', 'weekday', 'is_day_off', 'schedule_slots']

    def validate(self, data):
        recruiter = data['recruiter']
        schedule_slots = data.get('schedule_slots')
        is_day_off = data.get('is_day_off', False)

        if is_day_off:
            # Если день объявлен выходным, то временные слоты обнуляются
            data['schedule_slots'] = []
            return data
        if not is_day_off and not schedule_slots:
            raise serializers.ValidationError(
                "Для рекрутера необходимо указать доступные временные слоты")

        # Проверяю временные слоты на перекрытие с присланными
        if are_slots_overlapping(schedule_slots):
            raise serializers.ValidationError("Временные слоты пересекаются")

        return data

    def create(self, validated_data):
        recruiter = validated_data['recruiter']
        weekday = validated_data['weekday']
        if Schedule.objects.filter(recruiter=recruiter, weekday=weekday).exists():
            raise serializers.ValidationError({'weekday': "Для данного дня недели уже создано расписание"})
        schedule_slots = validated_data.pop('schedule_slots', [])
        schedule = super().create(validated_data)
        for schedule_slot in schedule_slots:
            ScheduleSlot.objects.create(schedule=schedule, **schedule_slot)
        return schedule

    def update(self, instance, validated_data):
        schedule_slots = validated_data.pop('schedule_slots', [])
        schedule = super().update(instance, validated_data)
        existed_slots = set(schedule.schedule_slots.all().values_list('id', flat=True))
        ScheduleSlot.objects.filter(id__in=existed_slots).delete()
        new_intervals = set()
        with transaction.atomic():
            for schedule_slot in schedule_slots:
                if "id" in schedule_slot:
                    # Обновляем
                    schedule_slot_id = schedule_slot['id']
                    ScheduleSlot.objects.filter(id=schedule_slot_id, schedule=instance).update(**schedule_slot)
                else:
                    # Создаем
                    serializer = ScheduleSlotSerializer(data=schedule_slot)
                    serializer.is_valid(raise_exception=True)
                    schedule_slot_id = serializer.save(schedule=instance).id
                new_intervals.add(schedule_slot_id)
            # Удаляем
        return schedule


class SpecialDaySlotSerializer(BaseModelSerializer):
    class Meta:
        model = SpecialDaySlot
        fields = ['id', 'start_time', 'end_time']
        extra_kwargs = {
            'id': {
                'read_only': False,
                'required': False,
                'allow_null': True
            }
        }

    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("Время начала интервала должно быть меньше времени окончания интервала")
        return data


class SpecialDayReadSerializer(BaseModelSerializer):
    special_day_slots = serializers.SerializerMethodField()

    class Meta:
        model = SpecialDay
        fields = ('id', 'date', 'special_day_slots', 'is_day_off')

    def get_special_day_slots(self, obj):
        if obj.is_day_off:
            return None
        slots = obj.special_day_slots.order_by('start_time')  # Сортируем временные слоты по времени начала
        return SpecialDaySlotSerializer(slots, many=True).data


class SpecialDayWriteSerializer(BaseModelSerializer):
    special_day_slots = SpecialDaySlotSerializer(many=True, required=False, allow_null=False)

    class Meta:
        model = SpecialDay
        fields = ['id', 'recruiter', 'date', 'is_day_off', 'special_day_slots']
        validators = [
            serializers.UniqueTogetherValidator(
                queryset=model.objects.all(),
                fields=('recruiter', 'date'),
                message="Для данной даты уже создано расписание"
            )
        ]

    def validate_date(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError("Дата дня-исключения не может быть в прошлом")
        return value

    def validate(self, data):
        recruiter = data['recruiter']
        special_day_slots = data.get('special_day_slots')
        is_day_off = data.get('is_day_off', False)
        if is_day_off:
            # Если день объявлен выходным, то временные слоты обнуляются
            data['special_day_slots'] = []
            return data

        if not special_day_slots:
            raise serializers.ValidationError(
                "Для рекрутера необходимо указать доступные временные слоты")

        # Проверяю временные слоты на перекрытие с присланными
        if are_slots_overlapping(special_day_slots):
            raise serializers.ValidationError("Временные слоты пересекаются")

        return data

    def create(self, validated_data):
        special_day_slots = validated_data.pop('special_day_slots', [])
        special_day = super().create(validated_data)
        for special_day_slot in special_day_slots:
            SpecialDaySlot.objects.create(special_day=special_day, **special_day_slot)
        return special_day

    def update(self, instance, validated_data):
        special_day_slots = validated_data.pop('special_day_slots', [])
        special_day = super().update(instance, validated_data)
        existed_slots = set(special_day.special_day_slots.all().values_list('id', flat=True))
        new_intervals = set()
        # TODO Если прислать временной слот, который уже есть в БД для создания, то возникнет исключение.
        # подумать, как обработать
        with transaction.atomic():
            for special_day_slot in special_day_slots:
                if "id" in special_day_slot:
                    # Обновляем
                    special_day_slot_id = special_day_slot['id']
                    SpecialDaySlot.objects.filter(id=special_day_slot_id, special_day=instance).update(
                        **special_day_slot)
                else:
                    # Создаем
                    serializer = SpecialDaySlotSerializer(data=special_day_slot)
                    serializer.is_valid(raise_exception=True)
                    special_day_slot_id = serializer.save(special_day=instance).id
                new_intervals.add(special_day_slot_id)
            # Удаляем
            intervals_to_delete = existed_slots - new_intervals
            SpecialDaySlot.objects.filter(id__in=intervals_to_delete).delete()
        return special_day


class EventSlotReadSerializer(BaseModelSerializer):
    class Meta:
        model = EventSlot
        fields = ['id', 'start_time', 'end_time']


class CalendarEventReadSerializer(BaseModelSerializer):
    recruiter = ReadRecruiterSerializer(source='recruiter.admin_info')
    candidate = CandidateSerializer()
    slots = serializers.SerializerMethodField()
    start_datetime = serializers.SerializerMethodField()
    end_datetime = serializers.SerializerMethodField()
    interview = InterviewSerializer()

    class Meta:
        model = CalendarEvent
        fields = (
            'id',
            'recruiter',
            'candidate',
            'name',
            'description',
            'meeting_url',
            'slots',
            'start_date',
            'end_date',
            'start_datetime',
            'end_datetime',
            'interview'
        )

    def get_slots(self, obj):
        return EventSlotReadSerializer(obj.booking_slots, many=True).data

    def get_start_datetime(self, obj):
        first_slot = obj.booking_slots.order_by('start_time').first()
        datetime_obj = datetime.datetime.combine(obj.start_date, first_slot.start_time)
        return datetime_obj.isoformat()

    def get_end_datetime(self, obj):
        last_slot = obj.booking_slots.order_by('end_time').last()
        datetime_obj = datetime.datetime.combine(obj.end_date, last_slot.end_time)
        return datetime_obj.isoformat()


class CalendarEventWriteSerializer(BaseModelSerializer):
    slots = serializers.ListField(child=serializers.UUIDField(), required=False)

    class Meta:
        model = CalendarEvent
        fields = (
            'id',
            'recruiter',
            'name',
            'description',
            'slots',
            'start_date',
            'end_date',
            'meeting_url',
        )
        read_only_fields = (
            'id',
        )

    def validate(self, data):
        recruiter = data.get('recruiter')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        slots = data.get('slots')

        # Общие проверки

        # Проверяю, что дата бронирования не в прошлом
        if start_date < datetime.date.today():
            raise serializers.ValidationError("Дата бронирования не может быть в прошлом")

        # Проверяю, что дата начала меньше даты окончания
        if start_date > end_date:
            raise serializers.ValidationError("Дата начала не может быть больше даты окончания")

        check_slots = True
        if self.instance:
            # Заглушка
            if not slots:
                check_slots = False
                data['slots'] = None

        if check_slots:
            if not slots:
                raise serializers.ValidationError("Не выбраны слоты бронирования")
            # Проверка слотов бронирования
            if (end_date - start_date).days != 0:
                raise serializers.ValidationError("Бронировать слоты можно только в рамках одного дня")

            available_slots = recruiter.get_available_slots(start_date)
            available_slots_dict = {available_slot['id']: available_slot for available_slot in available_slots}

            slots_for_booking = []

            for slot in slots:
                suspect_available_slot = available_slots_dict.get(str(slot))
                if not suspect_available_slot:
                    raise serializers.ValidationError("Выбранные слоты уже забронированы")
                slots_for_booking.append(suspect_available_slot)

            if len(slots_for_booking) > recruiter.admin_info.max_slots:
                raise serializers.ValidationError(
                    f"Вы можете забронировать не более {recruiter.admin_info.max_slots} слотов")

            data['slots'] = slots_for_booking
        return data

    def create(self, validated_data):
        slots = validated_data.pop('slots', [])
        validated_data['candidate'] = self.context.get('candidate')
        event = super().create(validated_data)
        # Создаю временные слоты бронирований
        for slot in slots:
            EventSlot.objects.create(
                start_time=slot['start_time'],
                end_time=slot['end_time'],
                event=event
            )
        # Сохраняю бронирование

        return event

    def update(self, instance, validated_data):
        slots = validated_data.pop('slots', [])

        instance = super().update(instance, validated_data)
        if slots is not None:
            instance.booking_slots.all().delete()
            # Создаю временные слоты бронирований
            for slot in slots:
                EventSlot.objects.create(
                    start_time=slot['start_time'],
                    end_time=slot['end_time'],
                    event=instance
                )
        return instance


class AdminCalendarEventWriteSerializer(BaseModelSerializer):
    slots = serializers.ListField(child=serializers.UUIDField(), required=False)

    class Meta:
        model = CalendarEvent
        fields = (
            'id',
            "candidate",
            'name',
            'description',
            'meeting_url',
            'slots',
            'start_date',
            'end_date',
        )
        read_only_fields = (
            'id',
        )

    def validate(self, data):
        recruiter = self.context['recruiter']
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        slots = data.get('slots')

        # Общие проверки

        # Проверяю, что дата бронирования не в прошлом
        if start_date < datetime.date.today():
            raise serializers.ValidationError("Дата бронирования не может быть в прошлом")

        # Проверяю, что дата начала меньше даты окончания
        if start_date > end_date:
            raise serializers.ValidationError("Дата начала не может быть больше даты окончания")

        check_slots = True
        if self.instance:
            # Заглушка
            if not slots:
                check_slots = False
                data['slots'] = None

        if check_slots:
            if not slots:
                raise serializers.ValidationError("Не выбраны слоты бронирования")
            # Проверка слотов бронирования
            if (end_date - start_date).days != 0:
                raise serializers.ValidationError("Бронировать слоты можно только в рамках одного дня")

            available_slots = recruiter.get_available_slots(start_date)
            available_slots_dict = {available_slot['id']: available_slot for available_slot in available_slots}

            slots_for_booking = []

            for slot in slots:
                suspect_available_slot = available_slots_dict.get(str(slot))
                if not suspect_available_slot:
                    raise serializers.ValidationError("Выбранные слоты уже забронированы")
                slots_for_booking.append(suspect_available_slot)

            if len(slots_for_booking) > recruiter.admin_info.max_slots:
                raise serializers.ValidationError(
                    f"Вы можете забронировать не более {recruiter.admin_info.max_slots} слотов")

            data['slots'] = slots_for_booking
        return data

    def create(self, validated_data):
        slots = validated_data.pop('slots', [])
        event = super().create(validated_data)
        # Создаю временные слоты бронирований
        for slot in slots:
            EventSlot.objects.create(
                start_time=slot['start_time'],
                end_time=slot['end_time'],
                event=event
            )
        # Сохраняю бронирование

        return event

    def update(self, instance, validated_data):
        slots = validated_data.pop('slots', [])

        instance = super().update(instance, validated_data)
        if slots is not None:
            instance.booking_slots.all().delete()
            # Создаю временные слоты бронирований
            for slot in slots:
                EventSlot.objects.create(
                    start_time=slot['start_time'],
                    end_time=slot['end_time'],
                    event=instance
                )
        return instance
