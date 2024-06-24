import datetime
import logging

from django.core.cache import cache
from django.db import models
from django.db.models import Q

from base.ai.exceptions import OpenAIWrapperError
from base.models import BaseModel, WorkSchedule, EmploymentType
from base.utils.email import Email
from base.utils.exceptions import EmailSendError
from chat.models import ChatMessage
from settings.settings import FRONTEND_BASE_URL

logger = logging.getLogger(__name__)


class Vacancy(BaseModel):
    """Вакансии"""

    class VacancyStatus(models.IntegerChoices):
        NEW = 0, "Новая"
        ACTIVE = 1, "Активная"
        NON_ACTIVE = 2, "Неактивная"
        COMPLETED = 4, "Завершенная"
        ARCHIVE = 5, "Архивная"

    class VacancyCategory(models.IntegerChoices):
        TESTING = 0, "Тестирование"
        DEVELOPMENT = 1, "Разработка"
        ANALYTICS = 2, "Аналитика"
        MANAGEMENT = 3, "Менеджмент и развитие бизнеса"
        DATA_PRACTICE = 4, "Data-практика"
        ARCHITECTURE = 5, "Архитектура"
        DESIGN = 6, "Дизайн"
        MARKETING = 7, "Маркетинг"
        HR = 8, "HR"
        FINANCE = 9, "Финансы"
        SALES = 10, "Продажи"
        SUPPORT = 11, "Техническая поддержка"
        OTHER = 12, "Другое"

    responsible_recruiter = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        verbose_name='Ответственный рекрутер',
        related_name='vacancies',
        null=True,
        blank=True
    )
    status = models.IntegerField(
        choices=VacancyStatus.choices,
        verbose_name="Статус"
    )

    position = models.ForeignKey(
        'base.Position',
        on_delete=models.CASCADE,
        verbose_name='Должность',
        related_name='vacancies'
    )
    department = models.ForeignKey(
        'base.Department',
        on_delete=models.SET_NULL,
        verbose_name='Отдел',
        related_name='vacancies',
        null=True,
        blank=True
    )
    country = models.ForeignKey(
        'base.Country',
        on_delete=models.SET_NULL,
        verbose_name='Страна',
        related_name='vacancies',
        null=True,
        blank=True
    )
    city = models.ForeignKey(
        'base.City',
        on_delete=models.SET_NULL,
        verbose_name='Город',
        related_name='vacancies',
        null=True,
        blank=True
    )
    salary = models.IntegerField(
        verbose_name='Зарплата'
    )
    category = models.IntegerField(
        choices=VacancyCategory.choices,
        verbose_name='Категория',
        null=True,
        blank=True
    )
    work_schedule = models.IntegerField(
        choices=WorkSchedule.choices,
        verbose_name="График работы"
    )
    employment_type = models.IntegerField(
        choices=EmploymentType.choices,
        verbose_name="Тип занятости"
    )

    description = models.TextField(
        verbose_name='Описание',
        null=True,
        blank=True
    )
    tasks = models.TextField(
        verbose_name='Обязанности',
        null=True,
        blank=True
    )
    tasks_used_as_template = models.BooleanField(
        verbose_name='Задачи используются как шаблон?',
        default=False
    )
    skills = models.ManyToManyField(
        'base.Skill',
        verbose_name="Ключевые навыки",
        related_name="vacancies",
        blank=True
    )
    additional_requirements = models.TextField(
        verbose_name='Дополнительные требования',
        null=True,
        blank=True
    )
    benefits = models.TextField(
        verbose_name='Бонусы',
        null=True,
        blank=True
    )
    benefits_used_as_template = models.BooleanField(
        verbose_name='Преимущества используются как шаблон?',
        default=False
    )

    def __str__(self):
        return f"{self.id} -> {self.position} -> {self.department} [{self.get_status_display()}]"

    class Meta:
        verbose_name = 'Вакансия'
        verbose_name_plural = 'Вакансии'
        ordering = ['-created_at']

    def is_candidate_responded(self, user):
        recruiter_flow = self.recruiter_recruitment_flows.filter(candidate=user).first()
        if not recruiter_flow:
            return False
        if recruiter_flow.step != RecruiterFlow.Step.CANDIDATE_SELECTED:
            return True
        else:
            return False

    def increase_number_of_views(self):
        from dashboard.models import VacancyStatistic
        VacancyStatistic.objects.create(vacancy=self)
        return True

    def duplicate(self):
        vacancy_skills = self.skills.all()
        new_vacancy = self
        new_vacancy.id = None
        new_vacancy.tasks_used_as_template = False
        new_vacancy.benefits_used_as_template = False
        new_vacancy.status = Vacancy.VacancyStatus.NEW
        new_vacancy.save()
        new_vacancy.skills.set(vacancy_skills)
        return new_vacancy

    def get_suitable_candidates(self):
        """Получить список подходящих кандидатов"""
        from users.models import User, UserInformation
        from base.ai.serializers import AIVacancySerializer, AIUserInformationSerializer
        from base.ai.services import OpenAIWrapper

        cache_key = f"suitable_candidates_for_vacancy_{self.id}"

        suitable_candidates_list = cache.get(cache_key)
        if suitable_candidates_list is not None:
            return UserInformation.objects.filter(id__in=suitable_candidates_list)

        # Define the initial Q object for the skills condition
        skills_query = Q(skills__in=self.skills.all()) | Q(skills__isnull=True)

        # Check if self.salary is None
        if self.salary is not None:
            # Define the Q object for the salary condition
            salary_query = Q(preferred_salary__lte=self.salary) | Q(preferred_salary__isnull=True)
        else:
            # Only include candidates where preferred_salary is null
            salary_query = Q(preferred_salary__isnull=True)

        # Combine the conditions and filter the user information
        regular_suitable_candidates = list(
            UserInformation.objects.filter(
                salary_query,
                skills_query
            ).distinct().values_list('id', flat=True)
        )

        regular_suitable_candidates = UserInformation.objects.filter(id__in=regular_suitable_candidates)

        vacancy_info = AIVacancySerializer(self).data
        users_queryset = UserInformation.objects.filter(
            user__in=User.objects.filter(is_registered=True, is_active=True)
        )
        users_info = AIUserInformationSerializer(users_queryset, many=True).data

        try:
            openai = OpenAIWrapper()
            suitable_candidates = openai.find_suitable_candidates_for_vacancy(vacancy_info, users_info)
        except (OpenAIWrapperError, ValueError) as error:
            logger.error(f"Error while getting suitable candidates for vacancy {self.id}: {error}")
            return regular_suitable_candidates

        try:
            suitable_candidates = UserInformation.objects.filter(user__in=suitable_candidates)
        except ValueError:
            suitable_candidates = regular_suitable_candidates

        suitable_candidates_list = list(suitable_candidates.values_list('id', flat=True))
        print(suitable_candidates_list)
        if suitable_candidates_list:
            cache.set(cache_key, suitable_candidates_list, timeout=60 * 60 * 1)  # Cache for 1 hours

        return suitable_candidates

    def get_similar_vacancies(self):
        """Получить список похожих вакансий"""
        from base.ai.serializers import AIVacancySerializer
        from base.ai.services import OpenAIWrapper

        cache_key = f"similar_vacancies_{self.id}"

        similar_vacancies_list = cache.get(cache_key)
        if similar_vacancies_list is not None:
            return Vacancy.objects.filter(id__in=similar_vacancies_list, status=Vacancy.VacancyStatus.ACTIVE)

        # Define the initial Q object for the skills condition
        skills_query = Q(skills__in=self.skills.all()) | Q(skills__isnull=True)

        # Combine the conditions and filter the user information
        regular_similar_vacancies = list(
            Vacancy.objects.filter(skills_query, status=Vacancy.VacancyStatus.ACTIVE).distinct().values_list('id',
                                                                                                             flat=True))

        regular_similar_vacancies = Vacancy.objects.filter(id__in=regular_similar_vacancies)

        current_vacancy_info = AIVacancySerializer(self).data
        vacancies_info = AIVacancySerializer(regular_similar_vacancies, many=True).data

        try:
            openai = OpenAIWrapper()
            similar_vacancies = openai.find_similar_vacancies(current_vacancy_info, vacancies_info)
        except (OpenAIWrapperError, ValueError) as error:
            logger.error(f"Error while getting similar candidates for vacancy {self.id}: {error}")
            return regular_similar_vacancies

        try:
            similar_vacancies = Vacancy.objects.filter(id__in=similar_vacancies, status=Vacancy.VacancyStatus.ACTIVE)
        except ValueError:
            similar_vacancies = regular_similar_vacancies

        similar_vacancies_list = list(similar_vacancies.values_list('id', flat=True))
        print(similar_vacancies_list)
        if similar_vacancies_list:
            cache.set(cache_key, similar_vacancies_list, timeout=60 * 60 * 1)  # Cache for 1 hours

        return similar_vacancies


class RecruiterFlow(BaseModel):
    """Флоу процесса рекрутинга (рекрутер)"""

    class Step(models.IntegerChoices):
        APPLICANT_RESPONSE = 0, "Отклик соискателя"
        CANDIDATE_SELECTED = 1, "Кандидат отобран"
        GENERAL_INTERVIEW = 2, "Общее собеседование"
        WAITING_FOR_APPROVE = 3, "Ожидание согласования"
        TECHNICAL_INTERVIEW = 4, "Техническое собеседование"
        ADDITIONAL_INTERVIEW = 5, "Дополнительное собеседование"
        JOB_OFFER = 6, "Предложение о работе"
        DECLINED = 7, "Отказ"
        DELETED = 8, "Удалено"

    candidate = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        verbose_name='Кандидат',
        related_name='recruiter_recruitment_flows'
    )
    vacancy = models.ForeignKey(
        Vacancy,
        on_delete=models.CASCADE,
        verbose_name='Вакансия',
        related_name='recruiter_recruitment_flows'
    )
    step = models.IntegerField(
        choices=Step.choices,
        verbose_name='Шаг'
    )
    chat = models.ForeignKey(
        'chat.Chat',
        on_delete=models.SET_NULL,
        verbose_name='Чат c соискателем',
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.id} -> {self.vacancy.position.name} [{self.get_step_display()}]"

    class Meta:
        verbose_name = 'Флоу процесса рекрутинга (рекрутер)'
        verbose_name_plural = 'Флоу процессов рекрутинга (рекрутер)'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        self.set_chat()

    @staticmethod
    def allowed_steps():
        return {
            RecruiterFlow.Step.APPLICANT_RESPONSE: [
                RecruiterFlow.Step.GENERAL_INTERVIEW,
                RecruiterFlow.Step.DECLINED
            ],
            RecruiterFlow.Step.CANDIDATE_SELECTED: [
                RecruiterFlow.Step.GENERAL_INTERVIEW,
                RecruiterFlow.Step.DELETED
            ],
            RecruiterFlow.Step.GENERAL_INTERVIEW: [
                RecruiterFlow.Step.WAITING_FOR_APPROVE,
                RecruiterFlow.Step.DECLINED
            ],
            RecruiterFlow.Step.WAITING_FOR_APPROVE: [
                RecruiterFlow.Step.TECHNICAL_INTERVIEW,
                RecruiterFlow.Step.DECLINED
            ],
            RecruiterFlow.Step.TECHNICAL_INTERVIEW: [
                RecruiterFlow.Step.ADDITIONAL_INTERVIEW,
                RecruiterFlow.Step.DECLINED
            ],
            RecruiterFlow.Step.ADDITIONAL_INTERVIEW: [
                RecruiterFlow.Step.JOB_OFFER,
                RecruiterFlow.Step.DECLINED
            ],
            RecruiterFlow.Step.JOB_OFFER: [],
            RecruiterFlow.Step.DECLINED: [],
            RecruiterFlow.Step.DELETED: [
                RecruiterFlow.Step.CANDIDATE_SELECTED
            ]

        }

    def set_chat(self):
        from chat.models import Chat
        if self.chat:
            return self.chat

        chat_name = f"Чат по вакансии '{self.vacancy.position.name}'"
        chat, _ = Chat.objects.get_or_create(
            candidate=self.candidate,
            recruiter=self.vacancy.responsible_recruiter,
            name=chat_name
        )

        self.chat = chat
        self.save()

        return chat

    def send_message_to_chat(self, message, author=None):

        if not self.chat:
            self.chat = self.set_chat()

        chat_message = ChatMessage.objects.create(
            chat=self.chat,
            author=author,
            message=message
        )
        return chat_message

    def send_interview_invitation_message(self, interview):
        """Приглашение на интервью"""
        candidate = self.candidate
        recruiter = self.vacancy.responsible_recruiter
        position = self.vacancy.position
        interview_type_name = interview.get_interview_type_display()

        time_selection_link = Interview.TIME_SELECTION_LINK.format(
            base_url=FRONTEND_BASE_URL,
            interview_id=str(interview.id)
        )

        # Отправка сообщения в чат
        message = (f"Вы приглашены на {interview_type_name} собеседование по вакансии {position.name}."
                   f"Для выбора удобного времени собеседования или отказа от него, перейдя по ссылке: {time_selection_link}.")

        self.send_message_to_chat(message, None)

        # Отправка сообщения на почту
        email = Email()
        try:
            email.send_email_with_button(
                receivers=[candidate.email],
                subject="Приглашение на собеседование",
                title="Вас пригласили на собеседование",
                greeting=f"Здравствуйте, {candidate.fullname}!",
                main_text=f"""Меня зовут {recruiter.fullname}, я представляю компанию "Рексофт". 
                    Мы рады сообщить, что Ваше резюме на позицию {position.name} прошло отбор на {interview_type_name} соебседование.
                    Для дальнейшего прохождения собеседования или отказа от него, пожалуйста, перейдите на страницу выбора времени.\n
                    С нетерпением ждем встречи!
                    """,
                button_text="Выбрать время собеседования",
                button_link=time_selection_link,
                bottom_text=f"""С уважением, {recruiter.fullname}\n
                    {recruiter.admin_info.position}\n
                    {recruiter.admin_info.email}\n
                    {recruiter.admin_info.phone}
                    """
            )
        except EmailSendError as error:
            logger.error(
                f"Письмо для приглашения на интервью не было отправлено на почту {candidate.email}. Ошибка: {error}")
            return None

        return True

    def send_decline_message(self):
        candidate = self.candidate
        recruiter = self.vacancy.responsible_recruiter
        position = self.vacancy.position

        # Отправка сообщения в чат
        message = f"""
        Благодарим Вас за интерес, проявленный к компании "Рексофт" и за время, уделенное процессу отбора на позицию {position.name}.
        Мы внимательно рассмотрели Ваше резюме и результаты собеседования. К сожалению, на данный момент мы не можем предложить Вам эту позицию.
        Это решение было принято после тщательного анализа всех кандидатов и их соответствия требованиям вакансии.
        Мы ценим Ваши усилия и рекомендуем следить за нашими открытыми вакансиями в будущем.
        Возможно, появятся другие позиции, которые лучше соответствуют Вашим навыкам и опыту.
        Спасибо за Ваше внимание к нашей компании. Желаем Вам успехов в поиске подходящей работы и достижения профессиональных целей.
        """

        self.send_message_to_chat(message, None)

        # Отправка сообщения на почту
        email = Email()
        try:
            email.send_email_with_button(
                receivers=[candidate.email],
                subject="Отказ",
                title="Вам отказали в трудоустройстве",
                greeting=f"Здравствуйте, {candidate.fullname}!",
                main_text=message,
                button_link=FRONTEND_BASE_URL,
                button_text="Найти вакансии",
                bottom_text=f"""С уважением, {recruiter.fullname}\n
                            {recruiter.admin_info.position}\n
                            {recruiter.admin_info.email}\n
                            {recruiter.admin_info.phone}
                            """
            )
        except EmailSendError as error:
            logger.error(
                f"Письмо для отказа не было отправлено на почту {candidate.email}. Ошибка: {error}")
            return None

        return True

    def send_offer_message(self):
        candidate = self.candidate
        recruiter = self.vacancy.responsible_recruiter
        position = self.vacancy.position

        # Отправка сообщения в чат
        message = f"""
        Мы рады сообщить, что Вы успешно прошли все этапы отбора на позицию {position.name}.
        Поздравляем, Вам направлен оффер!
        Подробности предложения будут высланы на Вашу электронную почту в ближайшее время.
        Если у Вас возникнут вопросы, пожалуйста, не стесняйтесь обращаться ко мне.
        С нетерпением ждем Вас в нашей команде!
        """

        self.send_message_to_chat(message, None)

        # Отправка сообщения на почту
        email = Email()
        try:
            email.send_email_with_button(
                receivers=[candidate.email],
                subject="Оффер",
                title="Вам отправлен оффер",
                greeting=f"Здравствуйте, {candidate.fullname}!",
                main_text=f"""
                    Мы рады сообщить, что Вы успешно прошли все этапы отбора на позицию {position.name} и с удовольствием предлагаем Вам присоединиться к нашей команде.
                    Детали предложения следующие:
                    Должность: {position.name}
                    Зарплата: {self.vacancy.salary} рублей в месяц
                    График работы: с 9:00 до 18:00, 5/2
                    Дата начала работы: {datetime.datetime.now().date() + datetime.timedelta(days=14)}
                    Мы также предлагаем следующие льготы и преимущества:
                    Медицинская страховка
                    Оплачиваемый отпуск (28 рабочих дней)
                    Профессиональное развитие и обучение
                    Доступ к корпоративным мероприятиям и другим бонусам
                    
                    Пожалуйста, подтвердите свое согласие с условиями оффера, ответив на это письмо до {datetime.datetime.now().date() + datetime.timedelta(days=7)}.
                    Если у вас есть какие-либо вопросы или требуется дополнительная информация, не стесняйтесь обращаться к нам.
                    Мы очень рады перспективе работать с Вами и уверены, что Вы станете ценным дополнением нашей команды.
                    """,
                button_link=FRONTEND_BASE_URL,
                button_text="Перейти в личный кабинет",
                bottom_text=f"""С уважением, {recruiter.fullname}\n
                            {recruiter.admin_info.position}\n
                            {recruiter.admin_info.email}\n
                            {recruiter.admin_info.phone}
                            """
            )
        except EmailSendError as error:
            logger.error(
                f"Письмо для оффера не было отправлено на почту {candidate.email}. Ошибка: {error}")
            return None

        return True


class CandidateFlow(BaseModel):
    recruiter_flow = models.ForeignKey(
        'RecruiterFlow',
        on_delete=models.CASCADE,
    )
    step = models.IntegerField(
        choices=RecruiterFlow.Step.choices,
        verbose_name="Шаг"
    )

    class Meta:
        verbose_name = "Флоу кандидата"
        verbose_name_plural = 'Флоу кандидата'
        ordering = ['-created_at']


class Interview(BaseModel):
    """Собеседование"""
    TIME_SELECTION_LINK = "{base_url}/interview/time-selection/?interview_id={interview_id}"

    class InterviewType(models.IntegerChoices):
        GENERAL = 0, "Общее"
        TECHNICAL = 1, "Техническое"
        ADDITIONAL = 2, "Дополнительное"

    class InterviewStatus(models.IntegerChoices):
        WAITING_FOR_APPOINTMENT = 0, "Ожидание приглашения на интервью"
        WAITING_FOR_TIME_SELECTION = 1, "Ожидание выбора времени соискателем"
        SCHEDULED = 2, "Собеседование назначено"
        COMPLETED = 3, "Собеседование завершено"
        CANCELED_BY_RECRUITER = 4, "Собеседование отменено рекрутером"
        CANCELED_BY_CANDIDATE = 5, "Собеседование отменено соискателем"

    recruiter_flow = models.ForeignKey(
        RecruiterFlow,
        on_delete=models.CASCADE,
        verbose_name='Флоу процесса рекрутинга',
        related_name='interviews'
    )
    interview_type = models.IntegerField(
        choices=InterviewType.choices,
        verbose_name='Тип собеседования'
    )
    status = models.IntegerField(
        choices=InterviewStatus.choices,
        verbose_name='Статус',
        default=InterviewStatus.WAITING_FOR_APPOINTMENT
    )
    date = models.DateTimeField(
        verbose_name='Дата и время',
        null=True,
        blank=True
    )
    start_time = models.TimeField(
        verbose_name='Время начала',
        null=True,
        blank=True
    )
    end_time = models.TimeField(
        verbose_name='Время окончания',
        null=True,
        blank=True
    )
    meeting_link = models.URLField(
        verbose_name='Ссылка на встречу',
        null=True,
        blank=True
    )
    comment = models.TextField(
        verbose_name='Комментарий',
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.id} -> {self.recruiter_flow.vacancy.position.name} [{self.get_interview_type_display()}]"

    class Meta:
        verbose_name = 'Собеседование'
        verbose_name_plural = 'Собеседования'
        ordering = ['-created_at']
        unique_together = ['recruiter_flow', 'interview_type']


class FlowHistory(BaseModel):
    """История флоу процесса рекрутинга"""
    recruitment_flow = models.ForeignKey(
        RecruiterFlow,
        on_delete=models.CASCADE,
        verbose_name='Рекрутинговый процесс',
        related_name='history'
    )
    message = models.TextField(
        verbose_name='Сообщение'
    )

    def __str__(self):
        return f"{self.id} {self.message}"

    class Meta:
        verbose_name = 'История рекрутингового процесса'
        verbose_name_plural = 'Истории рекрутинговых процессов'
        ordering = ['-created_at']

    @staticmethod
    def add_record(recruitment_flow, message):
        return FlowHistory.objects.create(
            recruitment_flow=recruitment_flow,
            message=message
        )
