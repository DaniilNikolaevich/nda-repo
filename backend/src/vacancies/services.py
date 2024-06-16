import logging

from django.db.models import Q

from vacancies.exceptions import InterviewError
from vacancies.models import RecruiterFlow, FlowHistory, Interview

logger = logging.getLogger(__name__)


def invite_candidate_for_interview(recruiter_flow):
    """
    Отправляет приглашение на собеседование кандидату.
    """

    # Определение типа интервью
    if recruiter_flow.step == RecruiterFlow.Step.GENERAL_INTERVIEW:
        interview_type, interview_type_name = Interview.InterviewType.GENERAL, Interview.InterviewType.GENERAL.label
    elif recruiter_flow.step == RecruiterFlow.Step.TECHNICAL_INTERVIEW:
        interview_type, interview_type_name = Interview.InterviewType.TECHNICAL, Interview.InterviewType.TECHNICAL.label
    elif recruiter_flow.step == RecruiterFlow.Step.ADDITIONAL_INTERVIEW:
        interview_type, interview_type_name = Interview.InterviewType.ADDITIONAL, Interview.InterviewType.ADDITIONAL.label
    else:
        raise InterviewError(f"Невозможно определить тип собеседования")

    if recruiter_flow.interviews.filter(interview_type=interview_type).filter(
            ~Q(status=Interview.InterviewStatus.WAITING_FOR_APPOINTMENT)).exists():
        raise InterviewError(f"Собеседование уже назначено")

    FlowHistory.add_record(recruiter_flow, f"Кандидат приглашен на собеседование")

    # Создаем и присваиваем рекрутинговому процессу чат
    recruiter_flow.set_chat()

    # Создать интервью
    interview = Interview.objects.get(
        recruiter_flow=recruiter_flow,
        interview_type=interview_type,
    )

    interview.status = Interview.InterviewStatus.WAITING_FOR_TIME_SELECTION
    interview.save()

    # Отправляю сообщения в чат и на почту
    recruiter_flow.send_interview_invitation_message(interview)

    return interview
