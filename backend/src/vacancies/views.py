from django.core.exceptions import ObjectDoesNotExist
from django.utils.decorators import method_decorator
from rest_framework import status
from rest_framework.parsers import JSONParser, FormParser, MultiPartParser
from rest_framework.views import APIView

from base.utils.decorators import tryexcept, log_action
from base.utils.exceptions import BadRequestException
from base.utils.http import Response
from base.utils.http import get_user_from_authorization_header
from base.utils.paginators import AbstractPaginator, QuerySetProcessor
from users.decorators import auth
from users.filters import UserInformationFilter
from users.models import User, UserInformation
from users.serializer import UserInformationSerializer
from vacancies.exceptions import InterviewError
from vacancies.filters import VacancyFilter, RecruiterFlowFilter
from vacancies.models import Vacancy, RecruiterFlow, FlowHistory
from vacancies.serializers import VacancySerializer, SelectCandidateSerializer, \
    RespondVacancySerializer, FlowHistorySerializer, RecruiterFlowSerializer, VacancyStatusSerializer, \
    RecruiterFlowChangeStepSerializer, ChooseInterviewTimeSlotSerializer, DeclineInterviewByCandidateSerializer, \
    DeclineInterviewByRecruiterSerializer, SubscribeForNewVacanciesSerializer
from vacancies.services import invite_candidate_for_interview


@method_decorator([tryexcept, log_action], name='dispatch')
class CandidateVacancyView(APIView):
    def get(self, request, *args, **kwargs):
        paginator = AbstractPaginator(
            model=Vacancy,
            model_serializer=VacancySerializer,
            queryset=Vacancy.objects.filter(status=Vacancy.VacancyStatus.ACTIVE),
            filter_instance=VacancyFilter,
            context={"kwargs": kwargs},
            request=request
        )

        try:
            result = paginator.get_result(
                search_list=[
                    'tasks__icontains', 'additional_requirements__icontains', 'description__icontains',
                    'position__name__icontains',
                    'department__name__icontains'
                ])
        except BadRequestException as error:
            return Response(
                status=status.HTTP_400_BAD_REQUEST,
                content=error.message
            )
        return Response(result)


@method_decorator([tryexcept, log_action], name='dispatch')
class CandidateVacancyDetailView(APIView):
    vacancy = None

    def dispatch(self, request, *args, **kwargs):
        try:
            self.vacancy = Vacancy.objects.get(id=kwargs['vacancy_id'], status=Vacancy.VacancyStatus.ACTIVE)
        except ObjectDoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND, content='Vacancy not found')

        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        serializer = VacancySerializer(self.vacancy)
        return Response(serializer.data)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class RecruiterVacancyView(APIView):
    def dispatch(self, request, *args, **kwargs):
        current_user = kwargs.get('user')
        if not current_user.is_staff:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')

        return super().dispatch(request, *args, **kwargs)

    def get(self, request, user, *args, **kwargs):
        paginator = AbstractPaginator(
            model=Vacancy,
            model_serializer=VacancySerializer,
            queryset=Vacancy.objects.filter(responsible_recruiter=user),
            filter_instance=VacancyFilter,
            context={"kwargs": kwargs},
            request=request
        )

        try:
            result = paginator.get_result(
                search_list=[
                    'tasks__icontains', 'additional_requirements__icontains', 'description__icontains',
                    'position__name__icontains',
                    'department__name__icontains'
                ])
        except BadRequestException as error:
            return Response(
                status=status.HTTP_400_BAD_REQUEST,
                content=error.message
            )
        return Response(result)

    def post(self, request, user, *args, **kwargs):
        serializer = VacancySerializer(data=request.data, context={'responsible_recruiter': user})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_201_CREATED, content=serializer.data)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class RecruiterVacancyDetailView(APIView):
    vacancy = None

    def dispatch(self, request, *args, **kwargs):
        current_user = kwargs.get('user')
        if not current_user.is_staff:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')

        try:
            self.vacancy = Vacancy.objects.get(id=kwargs['vacancy_id'], responsible_recruiter=current_user)
        except ObjectDoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND, content='Вакансия не найдена')

        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        serializer = VacancySerializer(self.vacancy)
        return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        serializer = VacancySerializer(self.vacancy, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        serializer = VacancySerializer(self.vacancy, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class RecruiterVacancyStatusView(APIView):
    vacancy = None

    def dispatch(self, request, *args, **kwargs):
        current_user = kwargs.get('user')
        if not current_user.is_staff:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')

        try:
            self.vacancy = Vacancy.objects.get(id=kwargs['vacancy_id'], responsible_recruiter=current_user)
        except ObjectDoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND, content='Vacancy not found')

        return super().dispatch(request, *args, **kwargs)

    def put(self, request, user, *args, **kwargs):
        """Изменение статуса вакансии"""
        serializer = VacancyStatusSerializer(self.vacancy, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT, content="Статус вакансии успешно изменен")


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class RecruiterFlowView(APIView):
    vacancy = None

    def dispatch(self, request, *args, **kwargs):
        current_user = kwargs.get('user')
        if not current_user.is_staff:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')

        vacancy_id = kwargs.get('vacancy_id')
        try:
            self.vacancy = Vacancy.objects.get(id=vacancy_id, responsible_recruiter=current_user)
        except ObjectDoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND, content='Vacancy not found')
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, user, *args, **kwargs):

        queryset_processor = QuerySetProcessor(
            model=RecruiterFlow,
            model_serializer=RecruiterFlowSerializer,
            queryset=RecruiterFlow.objects.filter(vacancy=self.vacancy),
            filter_instance=RecruiterFlowFilter,
            context={"kwargs": kwargs},
            request=request
        )
        try:
            result = queryset_processor.get_result(search_list=[])
        except BadRequestException as error:
            return Response(
                status=status.HTTP_400_BAD_REQUEST,
                content=error.message
            )
        return Response(result)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class RecruiterFlowDetailView(APIView):
    recruiter_flow = None

    def dispatch(self, request, *args, **kwargs):
        current_user = kwargs.get('user')
        if not current_user.is_staff:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')

        recruiter_flow_id = kwargs.get('recruiter_flow_id')
        try:
            self.recruiter_flow = RecruiterFlow.objects.get(
                id=recruiter_flow_id,
                vacancy__responsible_recruiter=current_user
            )
        except ObjectDoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND, content='Recruiter Flow not found')
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, user, *args, **kwargs):
        serializer = RecruiterFlowSerializer(self.recruiter_flow)
        return Response(serializer.data)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class SelectCandidateView(APIView):
    def dispatch(self, request, *args, **kwargs):
        current_user = kwargs.get('user')
        if not current_user.is_staff:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')

        return super().dispatch(request, *args, **kwargs)

    def post(self, request, user, *args, **kwargs):
        """Добавить кандидата в 'Отобранные' """
        serializer = SelectCandidateSerializer(data=request.data, context={"recruiter": user})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_201_CREATED, content="Кандидат успешно добавлен в подборку")


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class InviteCandidateView(APIView):
    def dispatch(self, request, *args, **kwargs):
        current_user = kwargs.get('user')
        if not current_user.is_staff:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')

        return super().dispatch(request, *args, **kwargs)

    def post(self, request, recruiter_flow_id, user, *args, **kwargs):
        """Пригласить кандидата на собеседование (общее, техническое или дополнительное)"""
        try:
            recruiter_flow = RecruiterFlow.objects.get(id=recruiter_flow_id)
        except ObjectDoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND, content='Recruiter Flow not found')

        if recruiter_flow.vacancy.responsible_recruiter != user:
            return Response(
                status=status.HTTP_400_BAD_REQUEST,
                content="Вы не являетесь ответственным рекрутером по этой вакансии"
            )

        if recruiter_flow.step not in [RecruiterFlow.Step.GENERAL_INTERVIEW, RecruiterFlow.Step.TECHNICAL_INTERVIEW,
                                       RecruiterFlow.Step.ADDITIONAL_INTERVIEW]:
            return Response(
                status=status.HTTP_400_BAD_REQUEST,
                content="Кандидат не находится на шаге собеседования"
            )

        try:
            invite_candidate_for_interview(recruiter_flow)
        except InterviewError as error:
            return Response(status=status.HTTP_400_BAD_REQUEST, content=error.message)

        return Response(status=status.HTTP_201_CREATED, content="Кандидат приглашен на собеседование")


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class RespondVacancyView(APIView):
    def dispatch(self, request, *args, **kwargs):
        current_user = kwargs.get('user')
        if not current_user.is_candidate:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')

        return super().dispatch(request, *args, **kwargs)

    def post(self, request, user, *args, **kwargs):
        serializer = RespondVacancySerializer(data=request.data, context={'candidate': user})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_201_CREATED, content="Вы успешно откликнулись на вакансию")


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class FlowHistoryView(APIView):
    """История активности по заданному recruiter_flow_id"""

    def dispatch(self, request, *args, **kwargs):
        current_user = kwargs.get('user')
        if not current_user.is_staff:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')

        return super().dispatch(request, *args, **kwargs)

    def get(self, request, recruiter_flow_id, *args, **kwargs):
        queryset_processor = QuerySetProcessor(
            model=FlowHistory,
            model_serializer=FlowHistorySerializer,
            queryset=FlowHistory.objects.filter(recruitment_flow=recruiter_flow_id),
            context={"kwargs": kwargs},
            request=request

        )
        try:
            result = queryset_processor.get_result(search_list=[])
        except BadRequestException as error:
            return Response(
                status=status.HTTP_400_BAD_REQUEST,
                content=error.message
            )
        return Response(result)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class RecruiterFlowChangeStepView(APIView):
    recruiter_flow = None

    def dispatch(self, request, *args, **kwargs):
        current_user = kwargs.get('user')
        if not current_user.is_staff:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')

        recruiter_flow_id = kwargs.get('recruiter_flow_id')
        try:
            self.recruiter_flow = RecruiterFlow.objects.get(
                id=recruiter_flow_id, vacancy__responsible_recruiter=current_user
            )
        except ObjectDoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND, content='Recruiter Flow not found')

        return super().dispatch(request, *args, **kwargs)

    def put(self, request, user, *args, **kwargs):
        """Обновить шаг флоу рекрутера"""
        serializer = RecruiterFlowChangeStepSerializer(instance=self.recruiter_flow, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT, content="Шаг успешно изменен")


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class RecruitmentFlowAllowedStepsView(APIView):
    def dispatch(self, request, *args, **kwargs):
        current_user = kwargs.get('user')
        if not current_user.is_staff:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')

        recruiter_flow_id = kwargs.get('recruiter_flow_id')
        try:
            self.recruiter_flow = RecruiterFlow.objects.get(
                id=recruiter_flow_id, vacancy__responsible_recruiter=current_user
            )
        except ObjectDoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND, content='Recruiter Flow not found')

        return super().dispatch(request, *args, **kwargs)

    def get(self, request, user, *args, **kwargs):
        return Response(self.recruiter_flow.allowed_steps().get(self.recruiter_flow.step))


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class ChooseInterviewTimeSlotView(APIView):
    def dispatch(self, request, *args, **kwargs):
        current_user = kwargs.get('user')
        if not current_user.is_candidate:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, user, *args, **kwargs):
        serializer = ChooseInterviewTimeSlotSerializer(data=request.data, context={'candidate': user})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_201_CREATED, content="Время успешно выбрано")


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class DeclineInterviewByCandidateView(APIView):
    def dispatch(self, request, *args, **kwargs):
        current_user = kwargs.get('user')
        if not current_user.is_candidate:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, user, *args, **kwargs):
        serializer = DeclineInterviewByCandidateSerializer(data=request.data, context={'candidate': user})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_201_CREATED, content="Вы отказались от собеседования")


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class DeclineInterviewByRecruiterView(APIView):
    def dispatch(self, request, *args, **kwargs):
        current_user = kwargs.get('user')
        if not current_user.is_staff:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, user, *args, **kwargs):
        serializer = DeclineInterviewByRecruiterSerializer(data=request.data, context={'recruiter': user})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_201_CREATED, content="Вы отказались от собеседования")


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class DuplicateVacancyView(APIView):
    vacancy = None

    def dispatch(self, request, *args, **kwargs):
        current_user = kwargs.get('user')
        if not current_user.is_staff:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')

        try:
            vacancy_id = kwargs.get('vacancy_id')
            self.vacancy = Vacancy.objects.get(id=vacancy_id, responsible_recruiter=current_user)
        except ObjectDoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND, content='Вакансия не найдена')
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, user, *args, **kwargs):
        new_vacancy = self.vacancy.duplicate()
        return Response(status=status.HTTP_201_CREATED, content={"id": str(new_vacancy.id)})


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class CandidateView(APIView):
    def dispatch(self, request, *args, **kwargs):
        current_user = kwargs.get('user')
        if not current_user.is_staff:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, user, *args, **kwargs):
        queryset = UserInformation.objects.filter(
            user__role=User.Role.CANDIDATE,
            user__is_registered=True,
            user__is_active=True
        )
        paginator = AbstractPaginator(
            model=UserInformation,
            model_serializer=UserInformationSerializer,
            queryset=queryset,
            filter_instance=UserInformationFilter,
            context={"kwargs": kwargs},
            request=request
        )

        try:
            result = paginator.get_result(
                search_list=['preferred_position__name__icontains', 'skills__name__icontains', 'about__icontains',
                             'ai_summary__icontains'])
        except BadRequestException as error:
            return Response(
                status=status.HTTP_400_BAD_REQUEST,
                content=error.message
            )
        return Response(result)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class SuitableCandidatesView(APIView):
    """Подходящие для вакансии кандидаты"""

    def dispatch(self, request, *args, **kwargs):
        current_user = kwargs.get('user')
        if not current_user.is_staff:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')

        return super().dispatch(request, *args, **kwargs)

    def get(self, request, vacancy_id, *args, **kwargs):

        try:
            vacancy = Vacancy.objects.get(id=vacancy_id)
        except ObjectDoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND, content='Vacancy not found')

        suitable_candidates = vacancy.get_suitable_candidates()
        serializer = UserInformationSerializer(suitable_candidates, many=True)
        return Response(serializer.data)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class SuitableVacanciesView(APIView):
    """Подходящие для кандидата вакансии"""

    def dispatch(self, request, *args, **kwargs):
        current_user = kwargs.get('user')
        if not current_user.is_candidate:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')

        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        current_user = kwargs.get('user')
        suitable_vacancies = current_user.get_suitable_vacancies()
        serializer = VacancySerializer(suitable_vacancies, many=True)
        return Response(serializer.data)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class SimilarVacanciesView(APIView):
    """Похожие на текущую вакансию вакансии"""
    vacancy = None

    def dispatch(self, request, *args, **kwargs):
        current_user = kwargs.get('user')
        if not current_user.is_candidate:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')

        try:
            vacancy_id = kwargs.get('vacancy_id')
            self.vacancy = Vacancy.objects.get(id=vacancy_id)
        except ObjectDoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND, content='Вакансия не найдена')

        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        similar_vacancies = self.vacancy.get_similar_vacancies()
        serializer = VacancySerializer(similar_vacancies, many=True)
        return Response(serializer.data)


@method_decorator([tryexcept, log_action], name='dispatch')
class SubscribeForNewVacanciesView(APIView):
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def post(self, request, *args, **kwargs):
        authorization = request.headers.get('Authorization')
        if not authorization:
            user = None
        else:
            user = get_user_from_authorization_header(authorization)
            user.subscribe_for_vacancy_notifications()
            return Response(status=status.HTTP_201_CREATED, content="Вы успешно подписались на новые вакансии")

        serializer = SubscribeForNewVacanciesSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(status=status.HTTP_201_CREATED, content="Вы успешно подписались на новые вакансии")
