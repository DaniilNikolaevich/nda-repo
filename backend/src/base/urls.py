from django.urls import path

from base.views import CityView, SpecializationView, InstitutionView, SkillView, WorkScheduleView, SexView, \
    EmploymentTypeView, ContactTypeView, EducationLevelView, CountryView, PositionView, EmployeeCompanyView, \
    VacancyCategoryView, VacancyStatusView, RecruiterFlowStepView, InterviewTypeView, InterviewStatusView, \
    VacancyTemplateTasksView, VacancyTemplateBenefitsView, DepartmentView

urlpatterns = [
    path("skills", SkillView.as_view()),
    path("countries", CountryView.as_view()),
    path("cities", CityView.as_view()),
    path("specializations", SpecializationView.as_view()),
    path("institutions", InstitutionView.as_view()),
    path("work-schedules", WorkScheduleView.as_view()),
    path("sex", SexView.as_view()),
    path("employment-types", EmploymentTypeView.as_view()),
    path("contact-types", ContactTypeView.as_view()),
    path("education-levels", EducationLevelView.as_view()),
    path("positions", PositionView.as_view()),
    path("companies", EmployeeCompanyView.as_view()),
    path("vacancy-categories", VacancyCategoryView.as_view()),
    path("vacancy-statuses", VacancyStatusView.as_view()),
    path("template-tasks", VacancyTemplateTasksView.as_view()),
    path("template-benefits", VacancyTemplateBenefitsView.as_view()),
    path("recruiter-flow-steps", RecruiterFlowStepView.as_view()),
    path("interview-types", InterviewTypeView.as_view()),
    path("interview-statuses", InterviewStatusView.as_view()),
    path("departments", DepartmentView.as_view()),

]
