import datetime

from django.db.models import Q
from django.utils import timezone
from django.utils.timezone import get_default_timezone
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from base.serializers import BaseModelSerializer, CityField, CountryField, DepartmentField, PositionField, SkillsField
from base.utils.external_tools import get_meeting_link
from base.utils.helpers import parse_full_name
from calendars.models import CalendarEvent, EventSlot
from chat.serializers import ChatSerializer
from users.admin_settings.serializers import AdminUserSerializer
from users.models import User
from users.serializer import WorkScheduleField, EmploymentTypeField, CandidateSerializer
from vacancies.models import Vacancy, RecruiterFlow, FlowHistory, Interview, CandidateFlow


class StatusField(serializers.Field):
    def to_representation(self, value):
        name = Vacancy.VacancyStatus(value).label
        return {"id": value, "name": name}

    def to_internal_value(self, data):
        if data is None:
            raise serializers.ValidationError("Status field cannot be empty")
        elif isinstance(data, int):
            if data in Vacancy.VacancyStatus.values:
                return data
        raise serializers.ValidationError("Invalid input for status field")


class CategoryField(serializers.Field):
    def to_representation(self, value):
        name = Vacancy.VacancyCategory(value).label
        return {"id": value, "name": name}

    def to_internal_value(self, data):
        if data is None:
            raise serializers.ValidationError("Category field cannot be empty")
        elif isinstance(data, int):
            if data in Vacancy.VacancyCategory.values:
                return data
        raise serializers.ValidationError("Invalid input for category field")


class VacancyTemplateTasksSerializer(BaseModelSerializer):
    position = serializers.SerializerMethodField()

    class Meta:
        model = Vacancy
        fields = ['position', 'tasks']

    def get_position(self, obj):
        if obj.position:
            return obj.position.name
        return None


class VacancyTemplateBenefitsSerializer(BaseModelSerializer):
    position = serializers.SerializerMethodField()

    class Meta:
        model = Vacancy
        fields = ['position', 'benefits']

    def get_position(self, obj):
        if obj.position:
            return obj.position.name
        return None


class VacancySerializer(BaseModelSerializer):
    responsible_recruiter = AdminUserSerializer(read_only=True)
    status = StatusField(read_only=True)
    position = PositionField(verified=True)
    department = DepartmentField()
    country = CountryField(verified=True)
    city = CityField(verified=True)
    category = CategoryField(required=False, allow_null=True)
    work_schedule = WorkScheduleField(required=False)
    employment_type = EmploymentTypeField(required=False)
    skills = SkillsField(verified=True)
    candidate_response = serializers.SerializerMethodField()
    chat = serializers.SerializerMethodField()
    views_count = serializers.SerializerMethodField()

    def get_views_count(self, obj):
        from dashboard.models import VacancyStatistic
        return VacancyStatistic.objects.filter(vacancy=obj).count()

    def get_candidate_response(self, obj):
        current_vacancy_id = str(obj.id)
        user = self.context.get('user')
        vacancies_dict = self.context.get('vacancies_dict', {})
        if not user:
            return {
                "is_responded": None,
                "response_time": None
            }
        else:
            return {
                "is_responded": True if current_vacancy_id in vacancies_dict.keys() else False,
                "response_time": vacancies_dict.get(current_vacancy_id)
            }

    def get_chat(self, obj):
        user = self.context.get('user')
        if not user:
            return None
        recruiter_flow = obj.recruiter_recruitment_flows.filter(candidate=user).first()
        if not recruiter_flow:
            return None
        if not recruiter_flow.chat:
            return None
        return ChatSerializer(recruiter_flow.chat).data

    class Meta:
        model = Vacancy
        fields = [
            'id', 'responsible_recruiter', 'status', 'position', 'department',
            'country', 'city', 'salary', 'category', 'work_schedule', 'employment_type',
            'description', 'tasks', 'tasks_used_as_template', 'skills', 'additional_requirements',
            'benefits', 'benefits_used_as_template', 'candidate_response', 'chat', 'views_count', 'created_at'
        ]
        read_only_fields = ['responsible_recruiter', 'status']

    def create(self, validated_data):
        validated_data['status'] = Vacancy.VacancyStatus.NEW
        validated_data['responsible_recruiter'] = self.context['responsible_recruiter']
        return super().create(validated_data)


class VacancyStatusSerializer(BaseModelSerializer):
    status = StatusField()

    class Meta:
        model = Vacancy
        fields = ['status']

    def update(self, instance, validated_data):
        instance.status = validated_data['status']
        instance.save()
        return instance


class InterviewSerializer(BaseModelSerializer):
    interview_type = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Interview
        fields = [
            'id', 'interview_type', 'status', 'date', 'start_time', 'end_time', 'meeting_link',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_interview_type(self, obj):
        return {"id": obj.interview_type, "name": obj.get_interview_type_display()}

    def get_status(self, obj):
        return {"id": obj.status, "name": obj.get_status_display()}


class RecruiterFlowSerializer(BaseModelSerializer):
    vacancy = VacancySerializer()
    candidate = CandidateSerializer()
    step = serializers.SerializerMethodField()
    chat = ChatSerializer(read_only=True)
    interview = serializers.SerializerMethodField()

    def get_step(self, obj):
        return {"id": obj.step, "name": obj.get_step_display()}

    def get_interview(self, obj):
        if obj.step == RecruiterFlow.Step.GENERAL_INTERVIEW:
            interview_type = Interview.InterviewType.GENERAL
        elif obj.step == RecruiterFlow.Step.TECHNICAL_INTERVIEW:
            interview_type = Interview.InterviewType.TECHNICAL
        elif obj.step == RecruiterFlow.Step.ADDITIONAL_INTERVIEW:
            interview_type = Interview.InterviewType.ADDITIONAL
        else:
            interview_type = None
        interview = obj.interviews.filter(interview_type=interview_type).first()
        if interview:
            return InterviewSerializer(interview).data
        return None

    class Meta:
        model = RecruiterFlow
        fields = ['id', 'vacancy', 'candidate', 'interview', 'step', 'chat', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class SelectCandidateSerializer(serializers.Serializer):
    """Сериализатор для добавления кандидата в 'Отобранные'"""
    vacancy = serializers.PrimaryKeyRelatedField(queryset=Vacancy.objects.all())
    candidate = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    def validate(self, attrs):
        recruiter = self.context['recruiter']
        vacancy = attrs['vacancy']
        candidate = attrs['candidate']

        if vacancy.responsible_recruiter != recruiter:
            raise serializers.ValidationError(f"Вы не являетесь ответственным рекрутером по этой вакансии")

        if vacancy.status != Vacancy.VacancyStatus.ACTIVE:
            raise serializers.ValidationError("Вакансия не опубликована. Невозможно добавить кандидата")

        recruiter_flow = RecruiterFlow.objects.filter(
            vacancy=vacancy,
            candidate=candidate
        )
        if recruiter_flow.exists():
            candidate_step = recruiter_flow.first().get_step_display()
            raise serializers.ValidationError(f"Кандидат уже находится на шаге {candidate_step}")

        return attrs

    def create(self, validated_data):
        vacancy = validated_data['vacancy']
        candidate = validated_data['candidate']

        recruiter_flow = RecruiterFlow.objects.create(
            vacancy=vacancy,
            candidate=candidate,
            step=RecruiterFlow.Step.CANDIDATE_SELECTED
        )
        CandidateFlow.objects.create(
            recruiter_flow=recruiter_flow,
            step=RecruiterFlow.Step.CANDIDATE_SELECTED
        )
        FlowHistory.add_record(recruiter_flow, "Кандидат был добавлен на шаг 'Отобранные'")

        return recruiter_flow


class RespondVacancySerializer(serializers.Serializer):
    """Сериализатор для отклика кандидата на вакансию"""
    vacancy = serializers.PrimaryKeyRelatedField(queryset=Vacancy.objects.all())

    def validate(self, attrs):
        vacancy = attrs['vacancy']
        candidate = self.context['candidate']

        if vacancy.status != Vacancy.VacancyStatus.ACTIVE:
            raise serializers.ValidationError("Вакансия не опубликована. Невозможно откликнуться.")

        if RecruiterFlow.objects.filter(
                vacancy=vacancy,
                candidate=candidate).filter(
            ~Q(step=RecruiterFlow.Step.CANDIDATE_SELECTED)
        ).exists():
            raise serializers.ValidationError("Вы уже откликнулись на данную вакансию")

        return attrs

    def create(self, validated_data):
        vacancy = validated_data['vacancy']
        candidate = self.context['candidate']

        existing_recruiter_flow = RecruiterFlow.objects.filter(
            vacancy=vacancy,
            candidate=candidate,
            step__in=[
                RecruiterFlow.Step.CANDIDATE_SELECTED,
                RecruiterFlow.Step.GENERAL_INTERVIEW
            ]
        )

        if existing_recruiter_flow.exists():
            # Если рекрутер уже отобрал кандидата или он находится на этапе общего собеседования,
            # то изменяем шаг флоу на отклик соискателя
            existing_recruiter_flow = existing_recruiter_flow.first()
            existing_recruiter_flow.status = RecruiterFlow.Step.APPLICANT_RESPONSE
            existing_recruiter_flow.save()
            return existing_recruiter_flow

        recruiter_flow = RecruiterFlow.objects.create(
            vacancy=vacancy,
            candidate=candidate,
            step=RecruiterFlow.Step.APPLICANT_RESPONSE
        )

        CandidateFlow.objects.create(
            recruiter_flow=recruiter_flow,
            step=RecruiterFlow.Step.APPLICANT_RESPONSE
        )

        FlowHistory.add_record(recruiter_flow, "Кандидат откликнулся на вакансию")

        return recruiter_flow


class FlowHistorySerializer(BaseModelSerializer):
    class Meta:
        model = FlowHistory
        fields = ['id', 'message', 'created_at']
        read_only_fields = ['id', 'created_at']


class RecruiterFlowChangeStepSerializer(BaseModelSerializer):
    class Meta:
        model = RecruiterFlow
        fields = ['step']

    def validate_step(self, value):
        current_step = self.instance.step
        desired_step = value

        allowed_steps = RecruiterFlow.allowed_steps()[current_step]
        if desired_step not in allowed_steps:
            raise serializers.ValidationError(f"Невозможно перейти на шаг {desired_step}")

        return value

    def validate(self, attrs):
        vacancy = self.instance.vacancy
        if vacancy.status != Vacancy.VacancyStatus.ACTIVE:
            raise serializers.ValidationError("Вакансия не опубликована. Невозможно сменить шаг.")
        return attrs

    def update(self, instance, validated_data):
        desired_step = validated_data['step']

        interview_type = None
        if desired_step == RecruiterFlow.Step.GENERAL_INTERVIEW:
            interview_type = Interview.InterviewType.GENERAL
        if desired_step == RecruiterFlow.Step.TECHNICAL_INTERVIEW:
            interview_type = Interview.InterviewType.TECHNICAL
        if desired_step == RecruiterFlow.Step.ADDITIONAL_INTERVIEW:
            interview_type = Interview.InterviewType.ADDITIONAL

        if interview_type is not None:
            Interview.objects.create(
                recruiter_flow=self.instance,
                interview_type=interview_type,
                status=Interview.InterviewStatus.WAITING_FOR_APPOINTMENT
            )

        instance.step = desired_step
        instance.save()

        CandidateFlow.objects.create(
            recruiter_flow=instance,
            step=desired_step
        )

        if desired_step == RecruiterFlow.Step.JOB_OFFER:
            FlowHistory.add_record(self.instance, "Кандидату предложен оффер")
            self.instance.send_offer_message()
        elif desired_step == RecruiterFlow.Step.DECLINED:
            FlowHistory.add_record(self.instance, "Кандидату было отказано в работе")
            self.instance.send_decline_message()
        return instance


class ChooseInterviewTimeSlotSerializer(serializers.Serializer):
    interview = serializers.PrimaryKeyRelatedField(queryset=Interview.objects.all())
    time_slot = serializers.UUIDField()
    interview_date = serializers.DateField()

    def validate(self, attrs):
        interview = attrs['interview']
        time_slot = str(attrs['time_slot'])
        interview_date = attrs['interview_date']
        candidate = self.context['candidate']

        if interview.recruiter_flow.candidate != candidate:
            raise serializers.ValidationError("Вы не являетесь кандидатом на данном интервью. Невозможно выбрать время")

        if interview.status != Interview.InterviewStatus.WAITING_FOR_TIME_SELECTION:
            raise serializers.ValidationError("Невозможно выбрать время для интервью")

        available_slots = interview.recruiter_flow.vacancy.responsible_recruiter.get_available_slots(interview_date)

        available_slots_dict = {available_slot['id']: available_slot for available_slot in available_slots}
        suspect_available_slot = available_slots_dict.get(time_slot)
        if not suspect_available_slot:
            raise serializers.ValidationError("Выбранные слоты уже забронированы")

        attrs['time_slot'] = suspect_available_slot
        return attrs

    def create(self, validated_data):
        interview = validated_data['interview']
        time_slot = validated_data['time_slot']
        interview_date = validated_data['interview_date']

        meeting_link = get_meeting_link()

        # Создаю Event
        calendar_event = CalendarEvent.objects.create(
            recruiter=interview.recruiter_flow.vacancy.responsible_recruiter,
            candidate=interview.recruiter_flow.candidate,
            name=f"Собеседование по вакансии {interview.recruiter_flow.vacancy.position.name}",
            description=f"Собеседование по вакансии {interview.recruiter_flow.vacancy.position.name} с кандидатом {interview.recruiter_flow.candidate.fullname}",
            interview=interview,
            meeting_url=meeting_link,
            start_date=interview_date,
            end_date=interview_date
        )

        # Создаю EventSlot
        calendar_event_slot = EventSlot.objects.create(
            start_time=time_slot['start_time'],
            end_time=time_slot['end_time'],
            event=calendar_event
        )

        # Изменяю шаг Interview, назначаю ссылку, дату и время
        time_obj = datetime.datetime.strptime(time_slot['start_time'], '%H:%M').time()

        combined_datetime = datetime.datetime.combine(interview_date, time_obj)
        combined_datetime = timezone.make_aware(combined_datetime, get_default_timezone())

        interview.status = Interview.InterviewStatus.SCHEDULED
        interview.meeting_link = meeting_link
        interview.date = combined_datetime
        interview.start_time = time_slot['start_time']
        interview.end_time = time_slot['end_time']
        interview.save()

        FlowHistory.add_record(interview.recruiter_flow, "Кандидат выбрал время собеседования")

        return interview


class DeclineInterviewByCandidateSerializer(serializers.Serializer):
    interview = serializers.PrimaryKeyRelatedField(queryset=Interview.objects.all())

    def validate(self, attrs):
        interview = attrs['interview']
        candidate = self.context['candidate']

        if interview.recruiter_flow.candidate != candidate:
            raise serializers.ValidationError("Вы не являетесь кандидатом на данном интервью")

        if interview.status not in [
            Interview.InterviewStatus.WAITING_FOR_TIME_SELECTION,
            Interview.InterviewStatus.SCHEDULED
        ]:
            raise serializers.ValidationError("Невозможно отказаться от интервью на данном шаге")

        return attrs

    def create(self, validated_data):
        interview = validated_data['interview']

        interview.status = Interview.InterviewStatus.CANCELED_BY_CANDIDATE
        interview.save()

        FlowHistory.add_record(interview.recruiter_flow, "Кандидат отказался от интервью")

        return interview


class DeclineInterviewByRecruiterSerializer(serializers.Serializer):
    interview = serializers.PrimaryKeyRelatedField(queryset=Interview.objects.all())

    def validate(self, attrs):
        interview = attrs['interview']
        recruiter = self.context['recruiter']

        if interview.recruiter_flow.vacancy.responsible_recruiter != recruiter:
            raise serializers.ValidationError("Вы не являетесь ответственным рекрутером на данном интервью")

        if interview.status not in [
            Interview.InterviewStatus.WAITING_FOR_APPOINTMENT,
            Interview.InterviewStatus.WAITING_FOR_TIME_SELECTION,
            Interview.InterviewStatus.SCHEDULED
        ]:
            raise serializers.ValidationError("Невозможно отказаться от интервью на данном шаге")

        return attrs

    def create(self, validated_data):
        interview = validated_data['interview']

        interview.status = Interview.InterviewStatus.CANCELED_BY_RECRUITER
        interview.save()

        FlowHistory.add_record(interview.recruiter_flow, "Рекрутер отказался от интервью")

        return interview


class SubscribeForNewVacanciesSerializer(serializers.Serializer):
    snp = serializers.CharField(max_length=255)
    cv_file = serializers.FileField(required=False, write_only=True)
    email = serializers.EmailField(required=False)

    def validate_snp(self, value):
        surname, name, patronymic = parse_full_name(value)
        self.context['name'] = name
        self.context['surname'] = surname
        self.context['patronymic'] = patronymic
        return value

    def validate_cv_file(self, value):
        if value is None:
            return None
        if value.size > 1 * 1024 * 1024:
            raise ValidationError("Файл слишком большой. Максимальный размер файла 1 МБ")

        file_extension = value.name.split('.')[-1]
        if file_extension not in ["pdf", "docx", "txt"]:
            raise ValidationError("Недопустимый формат файла. Допустимые форматы: pdf, docx, txt")

        return value

    def validate_email(self, value):
        if not value:
            raise ValidationError("Поле email не может быть пустым")

        if User.objects.filter(email=value, is_registered=True).exists():
            raise ValidationError("Пользователь с таким email уже существует")
        return value

    def create(self, validated_data):
        from users.tasks import process_user_cv

        validated_data.pop('snp', None)
        validated_data['name'] = self.context['name']
        validated_data['surname'] = self.context['surname']
        validated_data['patronymic'] = self.context['patronymic']

        email = validated_data.get('email')
        cv_file = validated_data.pop('cv_file', None)
        user = User.objects.create(**validated_data)
        user.send_verification_link(email)
        if cv_file:
            user.info.save_cv_file(cv_file)
            user.subscribe_for_vacancy_notifications()
            process_user_cv.apply_async(kwargs={"user_id": str(user.id)})
        return user
