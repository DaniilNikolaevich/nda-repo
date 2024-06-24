import datetime
import uuid

from django.contrib.auth.hashers import check_password, make_password
from django.contrib.postgres.fields import ArrayField
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import ExpressionWrapper, F, IntegerField, Q
from django.db.models.functions import ExtractWeekDay
from django.utils import timezone

from base.models import BaseModel, EmploymentType, logger, WorkSchedule
from base.utils.exceptions import S3ConnectionError, S3UploadError
from base.utils.files import S3Wrapper
from settings.settings import S3_CV_BUCKET, S3_SERVER, S3_USER_PHOTO_BUCKET, S3_COMMENTS_BUCKET


class User(BaseModel):
    class Role(models.IntegerChoices):
        CANDIDATE = 1, "Соискатель"
        RECRUITER = 2, "Рекрутер"
        ADMIN = 3, "Администратор"

    email = models.EmailField(
        verbose_name="Email"
    )
    name = models.CharField(
        max_length=255,
        verbose_name="Имя",
        null=True,
        blank=True
    )
    surname = models.CharField(
        max_length=255,
        verbose_name="Фамилия",
        null=True,
        blank=True
    )
    patronymic = models.CharField(
        max_length=255,
        verbose_name="Отчество",
        null=True,
        blank=True
    )
    role = models.IntegerField(
        choices=Role.choices,
        default=Role.CANDIDATE,
        verbose_name="Роль"
    )
    is_active = models.BooleanField(
        default=False,
        verbose_name="Активен?"
    )
    is_registered = models.BooleanField(
        default=False,
        verbose_name="Зарегистрирован?"
    )
    password_hash = models.TextField(
        verbose_name="Hash пароля",
        null=True,
        blank=True
    )

    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['email'],
                condition=Q(is_registered=True),
                name='unique_registered_email'
            )
        ]

    def __str__(self):
        return f"[{self.get_role_display()}] {self.id}. {self.fullname} - {self.email}"

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if self.role in [User.Role.ADMIN, User.Role.RECRUITER] and not AdminInformation.objects.filter(
                user=self).exists():
            AdminInformation.objects.create(user=self)
            return
        if is_new:
            if self.role not in [User.Role.ADMIN, User.Role.RECRUITER]:
                UserInformation.objects.create(user=self)

    @property
    def fullname(self):
        if self.patronymic:
            return f'{self.surname} {self.name} {self.patronymic}'
        else:
            return f'{self.surname} {self.name}'

    def check_password(self, plaintext_password):
        return check_password(plaintext_password, self.password_hash)

    def send_password_reset_link(self):
        from users.tasks import send_password_reset_link_task

        send_password_reset_link_task.apply_async(
            kwargs={
                "user_id": str(self.id)
            }
        )

    def send_verification_link(self, user_email):
        from users.tasks import send_verification_link_task

        send_verification_link_task.apply_async(
            kwargs={
                "user_id": str(self.id),
                "user_email": user_email
            }
        )

    def subscribe_for_vacancy_notifications(self):
        from news_feed.models import SubscriptionEmail

        SubscriptionEmail.objects.create(
            email=self.email,
            is_active=True,
            subscription_type=SubscriptionEmail.SubscriptionType.VACANCIES
        )

        return True

    def get_responded_vacancies(self):
        from vacancies.models import RecruiterFlow, CandidateFlow, Vacancy
        candidate_flows = CandidateFlow.objects.filter(
            recruiter_flow__candidate=self,
            step__in=[RecruiterFlow.Step.APPLICANT_RESPONSE,
                      RecruiterFlow.Step.GENERAL_INTERVIEW]).order_by('created_at')

        vacancies = Vacancy.objects.filter(id__in=candidate_flows.values_list('recruiter_flow__vacancy__id', flat=True))

        existing_flows = []
        vacancies_dict = {}

        for candidate_flow in candidate_flows:
            recruiter_flow = str(candidate_flow.recruiter_flow.id)
            if recruiter_flow not in existing_flows:
                vacancies_dict[str(candidate_flow.recruiter_flow.vacancy.id)] = candidate_flow.created_at
                existing_flows.append(recruiter_flow)

        return vacancies, vacancies_dict

    @property
    def is_admin(self):
        return self.role == User.Role.ADMIN

    @property
    def is_recruiter(self):
        return self.role == User.Role.RECRUITER

    @property
    def is_candidate(self):
        return self.role == User.Role.CANDIDATE

    @property
    def is_staff(self):
        return self.is_admin or self.is_recruiter

    @staticmethod
    def _get_available_slots_for_session_booking_type(recruiter, date: datetime.date):
        """Получить доступные временные слоты для рекрутера"""
        from calendars.services import generate_slots, is_slot_overlapped

        #  Нахожу все существующие слоты бронирований на заданную дату
        existing_booking_slots = recruiter.events_recruiter.filter(
            start_date=date).annotate(
            start_time=F('booking_slots__start_time'),
            end_time=F('booking_slots__end_time')).values('start_time', 'end_time')

        existing_external_bookings = recruiter.external_bookings.filter(
            start_datetime__date__lte=date,
            end_datetime__date__gte=date
        )

        # Формирую словарь с временем начала и временем окончания временного слота
        existing_external_bookings_dict = {}
        for external_booking in existing_external_bookings:
            generate_slots(existing_external_bookings_dict,
                           external_booking.start_datetime,
                           external_booking.end_datetime)

        external_booking_slots = existing_external_bookings_dict.get(date, [])

        special_day = recruiter.special_days.filter(date=date).first()
        if special_day:
            if special_day.is_day_off:
                return []
            else:
                slots = special_day.special_day_slots.all().values('id', 'start_time', 'end_time')

        else:
            schedule = recruiter.schedules.filter(weekday=date.weekday()).first()
            if schedule:
                if schedule.is_day_off:
                    return []
                else:
                    slots = schedule.schedule_slots.all().values('id', 'start_time', 'end_time')
            else:
                return []

        available_slots = []
        for slot in slots:
            is_available = True
            for booking_slot in existing_booking_slots:
                if booking_slot['start_time'] == slot['start_time'] and booking_slot['end_time'] == slot['end_time']:
                    is_available = False
                    break
            else:
                is_slot_free = not any(is_slot_overlapped(slot, external_booking_slot) for
                                       external_booking_slot in external_booking_slots)
                if not is_slot_free:
                    is_available = False

            if is_available:
                slot['id'] = str(slot['id'])
                slot['start_time'] = slot['start_time'].strftime('%H:%M')
                slot['end_time'] = slot['end_time'].strftime('%H:%M')
                available_slots.append(slot)
        return sorted(available_slots, key=lambda x: x['start_time'])

    def get_available_slots(self, date: datetime.date):
        """Получить список доступных слотов на заданную дату."""
        if date < timezone.now().date():
            raise ValueError('Нельзя получить доступные слоты для даты в прошлом')
        return self._get_available_slots_for_session_booking_type(self, date)

    @staticmethod
    def _get_available_dates_for_session_booking_type(recruiter, dates: list[datetime.date]):
        """Получить список доступных дат для рекрутера с режимом бронированияиз списка дат"""
        from calendars.services import generate_slots, is_slot_overlapped

        # Смотрю, какие есть существующие бронирования на заданные даты

        # Для каждой даты нахожу доступное количество временных слотов (учитываю специальные дни (с учетом выходных дней))

        existing_bookings = recruiter.events_recruiter.filter(
            start_date__in=dates).annotate(
            date=F('start_date'),
            start_time=F('booking_slots__start_time'),
            end_time=F('booking_slots__end_time'),
            weekday=ExpressionWrapper(ExtractWeekDay('start_date') - 2, output_field=IntegerField()) % 7).values(
            'date', 'weekday', 'start_time', 'end_time').order_by('start_date', 'start_time')

        existing_bookings_dict = {}
        for existing_booking in existing_bookings:
            if existing_booking['date'] not in existing_bookings_dict:
                existing_bookings_dict[existing_booking['date']] = []
            existing_bookings_dict[existing_booking['date']].append({
                'start_time': existing_booking['start_time'],
                'end_time': existing_booking['end_time']
            })

        existing_external_bookings = recruiter.external_bookings.filter(start_datetime__date__lte=dates[-1],
                                                                        end_datetime__date__gte=dates[0])

        existing_external_bookings_dict = {}

        for external_booking in existing_external_bookings:
            generate_slots(existing_external_bookings_dict,
                           external_booking.start_datetime,
                           external_booking.end_datetime)

        available_special_day_slots = recruiter.special_days.filter(
            date__in=dates,
            is_day_off=False).annotate(
            start_time=F('special_day_slots__start_time'),
            end_time=F('special_day_slots__end_time')).values(
            'date', 'start_time', 'end_time').order_by('date', 'start_time')

        available_special_day_slots_dict = {}
        for available_special_day_slot in available_special_day_slots:
            if available_special_day_slot['date'] not in available_special_day_slots_dict:
                available_special_day_slots_dict[available_special_day_slot['date']] = []
            if available_special_day_slot['start_time'] is None or available_special_day_slot['end_time'] is None:
                continue
            available_special_day_slots_dict[available_special_day_slot['date']].append({
                'start_time': available_special_day_slot['start_time'],
                'end_time': available_special_day_slot['end_time']
            })

        available_schedule_slots = recruiter.schedules.filter(
            is_day_off=False).annotate(
            start_time=F('schedule_slots__start_time'),
            end_time=F('schedule_slots__end_time')).values(
            'weekday', 'start_time', 'end_time').order_by('weekday', 'start_time')

        available_schedule_slots_dict = {}
        for available_schedule_slot in available_schedule_slots:
            if available_schedule_slot['weekday'] not in available_schedule_slots_dict:
                available_schedule_slots_dict[available_schedule_slot['weekday']] = []
            if available_schedule_slot['start_time'] is None or available_schedule_slot['end_time'] is None:
                continue
            available_schedule_slots_dict[available_schedule_slot['weekday']].append({
                'start_time': available_schedule_slot['start_time'],
                'end_time': available_schedule_slot['end_time']
            })

        available_slots = {}
        for date in dates:

            available_special_day_slots = available_special_day_slots_dict.get(date, [])
            available_schedule_slots = available_schedule_slots_dict.get(date.weekday(), [])

            if date in existing_bookings_dict or date in existing_external_bookings_dict:
                # Проверяю все ли слоты заняты в соответствии со специальным днем или с расписанием
                # Если все слоты заняты, то день недоступен, если есть свободные слоты, то день доступен
                matched_slots_count = 0
                has_free_slot = False
                booking_slots = existing_bookings_dict.get(date, [])
                external_booking_slots = existing_external_bookings_dict.get(date, [])

                if available_special_day_slots:
                    for available_special_day_slot in available_special_day_slots:
                        for booking_slot in booking_slots:
                            if available_special_day_slot['start_time'] == booking_slot['start_time'] and \
                                    available_special_day_slot['end_time'] == booking_slot['end_time']:
                                matched_slots_count += 1
                                break
                        # Проверка, есть ли такие external_booking_slot, которые полностью или частично перекроют available_schedule_slot
                        is_slot_free = not any(is_slot_overlapped(available_special_day_slot, external_booking_slot) for
                                               external_booking_slot in external_booking_slots)
                        if is_slot_free:
                            has_free_slot = True

                    if matched_slots_count == len(available_special_day_slots):
                        available_slots[date] = False
                    else:
                        if external_booking_slots and not has_free_slot:
                            available_slots[date] = False
                        else:
                            available_slots[date] = True

                elif available_schedule_slots:
                    for available_schedule_slot in available_schedule_slots:
                        for booking_slot in booking_slots:
                            if available_schedule_slot['start_time'] == booking_slot['start_time'] and \
                                    available_schedule_slot['end_time'] == booking_slot['end_time']:
                                matched_slots_count += 1
                                break
                        # Проверка, есть ли такие external_booking_slot, которые полностью или частично перекроют available_schedule_slot
                        is_slot_free = not any(is_slot_overlapped(available_schedule_slot, external_booking_slot) for
                                               external_booking_slot in external_booking_slots)
                        if is_slot_free:
                            has_free_slot = True

                    if matched_slots_count == len(available_schedule_slots):
                        available_slots[date] = False
                    else:
                        if external_booking_slots and not has_free_slot:
                            available_slots[date] = False
                        else:
                            available_slots[date] = True

                else:
                    # Если нет специального рабочего времени и не задан день недели в расписании, то день недоступен
                    available_slots[date] = False

            else:
                # Если бронирований нет, то необходимо убедиться, что данная дата есть в специальных днях или в расписании (по дню недели)
                # Если есть, то день свободен, если нет, то день недоступен (для него не задано расписание, либо день выходной)
                if available_special_day_slots or available_schedule_slots:
                    available_slots[date] = True
                else:
                    available_slots[date] = False

        available_slots = {str(date): available_status for date, available_status in available_slots.items()}
        return available_slots

    def get_available_dates(self, dates: list[datetime.date]):
        """Получить список доступных дат из списка дат"""
        return self._get_available_dates_for_session_booking_type(self, dates)

    def check_availability(self, date: datetime.date):
        """Проверить доступность территории на заданную дату"""
        return bool(self.get_available_slots(date))

    def get_suitable_vacancies(self):
        """Получить список подходящих вакансий"""
        from vacancies.models import Vacancy
        from base.ai.serializers import AIUserInformationSerializer, AIVacancySerializer
        from base.ai.services import OpenAIWrapper
        from base.ai.exceptions import OpenAIWrapperError

        cache_key = f"suitable_vacancies_for_candidate_{self.id}"

        suitable_vacancies_list = cache.get(cache_key)
        if suitable_vacancies_list is not None:
            return Vacancy.objects.filter(id__in=suitable_vacancies_list)

        # Define the initial Q object for the skills condition
        skills_query = Q(skills__in=self.info.skills.all()) | Q(skills__isnull=True)

        # Check if preferred_salary is None
        if self.info.preferred_salary is not None:
            # Define the Q object for the salary condition
            salary_query = Q(salary__gte=self.info.preferred_salary) | Q(salary__isnull=True)
        else:
            # Only include vacancies where salary is null
            salary_query = Q(salary__isnull=True)

        # Combine the conditions and filter the vacancies
        regular_suitable_vacancies = list(
            Vacancy.objects.filter(
                salary_query,
                skills_query
            ).distinct().values_list('id', flat=True)
        )

        regular_suitable_vacancies = Vacancy.objects.filter(id__in=regular_suitable_vacancies)

        user_info = AIUserInformationSerializer(self.info).data

        vacancy_queryset = Vacancy.objects.filter(status=Vacancy.VacancyStatus.ACTIVE)
        vacancies_info = AIVacancySerializer(vacancy_queryset, many=True).data

        try:
            openai = OpenAIWrapper()
            suitable_vacancies = openai.find_suitable_vacancies_for_candidate(user_info, vacancies_info)
        except (OpenAIWrapperError, ValueError) as error:
            logger.error(f"Error while getting suitable vacancies for candidate {self.id}: {error}")
            return regular_suitable_vacancies

        try:
            suitable_vacancies = Vacancy.objects.filter(id__in=suitable_vacancies)
        except ValueError:
            suitable_vacancies = regular_suitable_vacancies

        suitable_vacancies_list = list(suitable_vacancies.values_list('id', flat=True))
        print(suitable_vacancies_list)
        if suitable_vacancies_list:
            cache.set(cache_key, suitable_vacancies_list, timeout=60 * 60 * 1)  # Cache for 1 hour

        return suitable_vacancies


class VerificationCode(BaseModel):
    PASSWORD_RESET_CODE_VALID_MINUTES = 15
    PASSWORD_RESET_LINK = "{base_url}/reset-password-confirmation?verification_code={verification_code}"
    EMAIL_VERIFICATION_CODE_VALID_MINUTES = 15
    SET_PASSWORD_LINK = verification_link = "{base_url}/set-password?verification_code={verification_code}"

    class VerificationType(models.IntegerChoices):
        SET_PASSWORD = 1, "Первичное задание пароля"
        PASSWORD_RESET = 2, "Сброс пароля"

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        verbose_name="Пользователь",
        null=True,
        blank=True
    )
    verification_type = models.IntegerField(
        choices=VerificationType.choices,
        default=VerificationType.SET_PASSWORD,
        verbose_name="Тип подтверждения"
    )
    email = models.EmailField(
        verbose_name="Email пользователя",
        null=True,
        blank=True
    )
    code = models.UUIDField(
        default=uuid.uuid4,
        verbose_name="Уникальный код",
        unique=True
    )
    valid_until = models.DateTimeField(
        verbose_name="Код активен до"
    )
    is_used = models.BooleanField(
        default=False,
        verbose_name="Использован?"
    )

    class Meta:
        verbose_name = "Код подтверждения"
        verbose_name_plural = "Коды подтверждения"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.id}. {self.user} - {self.code}"

    def is_expired(self):
        return self.valid_until < timezone.now()

    def complete_registration(self, password):
        self.user.password_hash = make_password(password)
        self.user.is_registered = True
        self.user.is_active = True
        self.user.save()
        self.is_used = True
        self.save()
        return self.user

    def complete_password_reset(self, new_password):
        self.user.password_hash = make_password(new_password)
        self.user.save()

        self.is_used = True
        self.save()


class UserInformation(BaseModel):
    class Sex(models.IntegerChoices):
        NONE = 0, "Не указан"
        MALE = 1, "Мужской"
        FEMALE = 2, "Женский"

    class ContactType(models.IntegerChoices):
        PHONE = 0, 'Телефон'
        EMAIL = 1, 'Email'
        TELEGRAM = 2, 'Telegram'
        WHATSAPP = 3, 'WhatsApp'
        LINKEDIN = 4, 'LinkedIn'
        VK = 5, 'VK'
        FACEBOOK = 6, 'Facebook'
        GITHUB = 7, 'GitHub'
        SKYPE = 8, 'Skype'
        BEHANCE = 9, 'Behance'
        DRIBBBLE = 10, 'Dribbble'
        BITBUCKET = 11, 'Bitbucket'
        YOUTUBE = 12, 'YouTube'

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        verbose_name="Пользователь",
        related_name="info"
    )
    sex = models.IntegerField(
        choices=Sex.choices,
        verbose_name="Пол",
        default=Sex.NONE
    )
    birth_date = models.DateField(
        verbose_name="Дата рождения",
        null=True,
        blank=True
    )
    about = models.TextField(
        verbose_name="О себе",
        null=True,
        blank=True
    )
    ai_summary = models.TextField(
        verbose_name="AI Summary",
        null=True,
        blank=True
    )
    preferred_work_schedule = ArrayField(
        models.IntegerField(choices=WorkSchedule.choices),
        blank=True,
        default=list,
        verbose_name="Предпочитаемый график работы"
    )
    preferred_employment_type = ArrayField(
        models.IntegerField(choices=EmploymentType.choices),
        blank=True,
        default=list,
        verbose_name="Предпочитаемый тип занятости"
    )
    preferred_position = models.ForeignKey(
        'base.Position',
        on_delete=models.SET_NULL,
        verbose_name="Желаемая должность",
        related_name="users_info",
        null=True,
        blank=True
    )
    preferred_salary = models.IntegerField(
        verbose_name="Желаемая зарплата",
        null=True,
        blank=True
    )
    business_trip = models.BooleanField(
        verbose_name="Готов к командировкам?",
        null=True,
        blank=True
    )
    relocation = models.BooleanField(
        verbose_name="Готов к переезду?",
        null=True,
        blank=True
    )
    personalized_questions = ArrayField(
        models.TextField(),
        verbose_name="Персонализированные вопросы",
        blank=True,
        default=list
    )
    contacts = models.JSONField(
        verbose_name="Контакты",
        default=list
    )
    telegram_chat_id = models.CharField(
        max_length=255,
        verbose_name="ID чата в Telegram",
        null=True,
        blank=True
    )
    country = models.ForeignKey(
        'base.Country',
        on_delete=models.SET_NULL,
        verbose_name="Страна",
        related_name="users_info",
        null=True,
        blank=True
    )
    city = models.ForeignKey(
        'base.City',
        on_delete=models.SET_NULL,
        verbose_name="Город",
        related_name="users_info",
        null=True,
        blank=True
    )
    skills = models.ManyToManyField(
        'base.Skill',
        verbose_name="Ключевые навыки",
        related_name="users_info",
        blank=True
    )
    avatar = models.UUIDField(
        verbose_name="ID Аватара",
        null=True,
        blank=True
    )
    avatar_thumbnail = models.UUIDField(
        verbose_name="ID миниатюры аватара",
        null=True,
        blank=True
    )
    cv = models.UUIDField(
        verbose_name="ID Резюме",
        null=True,
        blank=True
    )
    cv_filename = models.CharField(
        max_length=1024,
        verbose_name="Имя файла резюме",
        null=True,
        blank=True
    )
    recruiter_note = models.TextField(
        verbose_name="Заметка рекрутера",
        null=True,
        blank=True
    )
    total_experience = models.IntegerField(
        verbose_name="Общий стаж работы",
        null=True,
        blank=True
    )

    class Meta:
        verbose_name = "Информация пользователя"
        verbose_name_plural = "Информация пользователей"
        ordering = ['-created_at']

    @property
    def avatar_url(self):
        if not self.avatar:
            return None
        url = f"{S3_SERVER}/{S3_USER_PHOTO_BUCKET}/{self.avatar}.jpg"
        return url

    @property
    def avatar_thumbnail_url(self):
        if not self.avatar_thumbnail:
            return None
        url = f"{S3_SERVER}/{S3_USER_PHOTO_BUCKET}/{self.avatar_thumbnail}.jpg"
        return url

    @property
    def cv_url(self):
        if not self.cv:
            return None
        cv_extension = self.cv_filename.split('.')[-1]
        url = f"{S3_SERVER}/{S3_CV_BUCKET}/{self.cv}.{cv_extension}"
        return url

    def __str__(self):
        return f"{self.user.id} {self.user.fullname}"

    def clean(self):
        if not self.contacts:
            return []
        for contact in self.contacts:
            type = contact.get('type')
            value = contact.get('value')
            is_preferred = contact.get('is_preferred')
            if type is None or value is None or is_preferred is None:
                raise ValidationError('Each contact must have a "type", "value" and "is_preferred".')
            if not isinstance(type, int) or not (0 <= type <= 12):
                raise ValidationError('Invalid contact type. Must be an integer between 0 and 12.')
            if not isinstance(is_preferred, bool):
                raise ValidationError('Предпочитаемый способ связи должен быть boolean.')
            if not isinstance(value, str):
                raise ValidationError('Значение должно быть строкой.')

    def save_cv_file(self, cv_file):
        try:
            s3 = S3Wrapper(S3_CV_BUCKET)
        except S3ConnectionError as error:
            logger.error(f"Failed to connect to S3: {error}")
            return
        file_name = uuid.uuid4()
        file_extension = cv_file.name.split('.')[-1]

        try:
            s3.upload_file(file=cv_file, file_name=f"{file_name}.{file_extension}")
        except S3UploadError as error:
            logger.error(f"Failed to upload CV file to S3: {error}")
            return

        self.cv = file_name
        self.cv_filename = cv_file.name
        self.save()

    def get_profile_occupancy(self):
        filled_fields_count = 0

        fields = [
            'work_experience', 'education', 'sex', 'birth_date', 'about', 'preferred_work_schedule',
            'preferred_employment_type', 'preferred_position', 'preferred_salary',
            'business_trip', 'relocation', 'contacts', 'country', 'city', 'skills', 'avatar'
        ]

        for field in fields:
            value = getattr(self, field, None)

            if isinstance(value, models.ManyToManyField):
                if value.exists():
                    filled_fields_count += 1
            elif isinstance(value, list) or isinstance(value, dict):
                if value:  # non-empty list or dict
                    filled_fields_count += 1
            elif value is not None and value != "":
                filled_fields_count += 1

        total_fields_count = len(fields)

        return {
            "total_fields": total_fields_count,
            "filled_fields": filled_fields_count,
        }


class UserWorkExperience(BaseModel):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        verbose_name="Пользователь",
        related_name="work_experience"
    )
    company = models.ForeignKey(
        'base.EmployeeCompany',
        on_delete=models.SET_NULL,
        verbose_name="Компания",
        related_name="users_work_experience",
        null=True,
        blank=True
    )
    position = models.ForeignKey(
        'base.Position',
        on_delete=models.SET_NULL,
        verbose_name="Должность",
        related_name="users_work_experience",
        null=True,
        blank=True
    )
    start_date = models.DateField(
        verbose_name="Дата начала",
        null=True,
        blank=True
    )
    end_date = models.DateField(
        verbose_name="Дата окончания",
        null=True,
        blank=True
    )
    duties = models.TextField(
        verbose_name="Обязанности",
        null=True,
        blank=True
    )
    achievements = models.TextField(
        verbose_name="Достижения",
        null=True,
        blank=True
    )

    class Meta:
        verbose_name = "Опыт работы пользователя"
        verbose_name_plural = "Опыт работы пользователей"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.id} {self.user.fullname} - {self.company}"


class UserEducation(BaseModel):
    class EducationLevel(models.IntegerChoices):
        SECONDARY = 1, "Среднее"
        SPECIALIZED_SECONDARY = 2, "Среднее специальное"
        INCOMPLETE_HIGHER = 3, "Неоконченное высшее"
        HIGHER = 4, "Высшее"
        BACHELOR = 5, "Бакалавр"
        MASTER = 6, "Магистр"
        PHD = 7, "Кандидат наук"
        DOCTOR = 8, "Доктор наук"
        COURSE = 9, "Курсы"

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        verbose_name="Пользователь",
        related_name="education"
    )
    institution = models.ForeignKey(
        'base.Institution',
        on_delete=models.SET_NULL,
        verbose_name="Образовательная организация",
        related_name="users_education",
        null=True,
        blank=True

    )
    start_date = models.DateField(
        verbose_name="Дата начала",
        null=True,
        blank=True
    )
    end_date = models.DateField(
        verbose_name="Дата окончания",
        null=True,
        blank=True
    )
    faculty = models.CharField(
        max_length=500,
        verbose_name="Факультет",
        null=True,
        blank=True
    )
    speciality = models.CharField(
        max_length=500,
        verbose_name="Специальность",
        null=True,
        blank=True
    )
    education_level = models.IntegerField(
        choices=EducationLevel.choices,
        verbose_name="Уровень образования",
        null=True,
        blank=True
    )

    class Meta:
        verbose_name = "Образование пользователя"
        verbose_name_plural = "Образование пользователей"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.id} {self.user.fullname} - {self.institution}"


class CalendarType(models.IntegerChoices):
    GOOGLE = 1, 'Google'
    YANDEX = 2, 'Yandex'
    APPLE = 3, 'Apple'
    BITRIX = 4, 'Bitrix'
    OTHER = 5, 'Другое'


class AdminInformation(BaseModel):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        verbose_name="Пользователь",
        related_name="admin_info"
    )
    position = models.CharField(
        max_length=255,
        verbose_name="Должность",
        null=True,
        blank=True
    )
    department = models.CharField(
        max_length=255,
        verbose_name="Отдел",
        null=True,
        blank=True
    )
    phone = models.CharField(
        max_length=255,
        verbose_name="Телефон",
        null=True,
        blank=True
    )
    email = models.EmailField(
        verbose_name="Email",
        null=True,
        blank=True
    )
    avatar = models.UUIDField(
        verbose_name="ID Аватара",
        null=True,
        blank=True
    )
    avatar_thumbnail = models.UUIDField(
        verbose_name="ID миниатюры аватара",
        null=True,
        blank=True
    )
    external_calendar_url = models.URLField(
        verbose_name="Ссылка на внешний календарь",
        null=True,
        blank=True
    )
    external_calendar_type = models.IntegerField(
        verbose_name='Тип календаря',
        choices=CalendarType.choices,
        default=CalendarType.GOOGLE
    )
    external_calendar_hash = models.CharField(
        max_length=32,
        verbose_name="Хэш календаря",
        null=True,
        blank=True
    )
    calendar_data = models.JSONField(
        verbose_name='Данные календаря',
        null=True,
        blank=True
    )
    max_slots = models.IntegerField(
        verbose_name="Максимальное количество слотов",
        null=True,
        default=1,
        blank=True
    )

    class Meta:
        verbose_name = "Информация рекрутера"
        verbose_name_plural = "Информация рекрутеров"
        ordering = ['-created_at']

    @property
    def avatar_url(self):
        if not self.avatar:
            return None
        url = f"{S3_SERVER}/{S3_USER_PHOTO_BUCKET}/{self.avatar}.jpg"
        return url

    @property
    def avatar_thumbnail_url(self):
        if not self.avatar_thumbnail:
            return None
        url = f"{S3_SERVER}/{S3_USER_PHOTO_BUCKET}/{self.avatar_thumbnail}.jpg"
        return url

    @property
    def external_calendar(self):
        from calendars.services import ExternalBookingCalendar
        return ExternalBookingCalendar(self.user)

    @property
    def booking_calendar_url(self):
        from calendars.services import BookingCalendar
        return BookingCalendar(self.user).get_calendar_url()

    @property
    def booking_calendar(self):
        from calendars.services import BookingCalendar
        return BookingCalendar(self.user)


class UserComment(BaseModel):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        verbose_name="Пользователь",
        related_name="comments"
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        verbose_name="Автор",
        related_name="authored_comments"
    )
    text = models.TextField(
        verbose_name="Текст комментария"
    )
    file_url = models.URLField(
        verbose_name="URL файла",
        null=True,
        blank=True
    )

    class Meta:
        verbose_name = "Комментарий о пользователе"
        verbose_name_plural = "Комментарии о пользователях"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.author.fullname} -> {self.user.fullname}"

    def save_comment_file(self, file):
        try:
            s3 = S3Wrapper(S3_COMMENTS_BUCKET)
        except S3ConnectionError as error:
            logger.error(f"Failed to connect to S3: {error}")
            return
        file_name = uuid.uuid4()
        file_extension = file.name.split('.')[-1]

        try:
            s3.upload_file(file=file, file_name=f"{file_name}.{file_extension}")
        except S3UploadError as error:
            logger.error(f"Failed to upload CV file to S3: {error}")
            return

        self.file_url = f"{S3_SERVER}/{S3_COMMENTS_BUCKET}/{file_name}.{file_extension}"
        self.save()
