from django.urls import path

from vacancies.views import RecruiterVacancyView, RecruiterVacancyDetailView, RecruiterFlowView, \
    SelectCandidateView, \
    CandidateVacancyView, CandidateVacancyDetailView, RespondVacancyView, FlowHistoryView, \
    RecruiterFlowDetailView, RecruiterVacancyStatusView, RecruiterFlowChangeStepView, InviteCandidateView, \
    RecruitmentFlowAllowedStepsView, ChooseInterviewTimeSlotView, DeclineInterviewByCandidateView, \
    DeclineInterviewByRecruiterView, DuplicateVacancyView, CandidateView, SuitableCandidatesView, SuitableVacanciesView, \
    SimilarVacanciesView, SubscribeForNewVacanciesView

urlpatterns = [
    path('subscribe', SubscribeForNewVacanciesView.as_view()),
    path('suitable-vacancies', SuitableVacanciesView.as_view()),
    path('candidates', CandidateView.as_view()),
    path('candidate-vacancies', CandidateVacancyView.as_view()),
    path('candidate-vacancies/<uuid:vacancy_id>', CandidateVacancyDetailView.as_view()),
    path('recruiter-vacancies', RecruiterVacancyView.as_view()),
    path('recruiter-vacancies/<uuid:vacancy_id>', RecruiterVacancyDetailView.as_view()),
    path('recruiter-vacancies/<uuid:vacancy_id>/status', RecruiterVacancyStatusView.as_view()),
    path('<uuid:vacancy_id>/recruiter-flows', RecruiterFlowView.as_view()),
    path('<uuid:vacancy_id>/suitable-candidates', SuitableCandidatesView.as_view()),
    path('<uuid:vacancy_id>/duplicate', DuplicateVacancyView.as_view()),
    path('<uuid:vacancy_id>/similar-vacancies', SimilarVacanciesView.as_view()),

    path('select-candidate', SelectCandidateView.as_view()),
    path('respond-vacancy', RespondVacancyView.as_view()),
    path('choose-time', ChooseInterviewTimeSlotView.as_view()),
    path('decline-by-recruiter', DeclineInterviewByRecruiterView.as_view()),
    path('decline-by-candidate', DeclineInterviewByCandidateView.as_view()),

    path('recruiter-flows/<uuid:recruiter_flow_id>', RecruiterFlowDetailView.as_view()),
    path('recruiter-flows/<uuid:recruiter_flow_id>/allowed-steps', RecruitmentFlowAllowedStepsView.as_view()),
    path('recruiter-flows/<uuid:recruiter_flow_id>/invite-candidate', InviteCandidateView.as_view()),
    path('recruiter-flows/<uuid:recruiter_flow_id>/change-step', RecruiterFlowChangeStepView.as_view()),
    path('recruiter-flows/<uuid:recruiter_flow_id>/history', FlowHistoryView.as_view()),

    path('interviews/<uuid:interview_id>/choose-time', ChooseInterviewTimeSlotView.as_view())
]
