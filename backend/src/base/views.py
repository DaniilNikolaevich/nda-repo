from rest_framework import status
from rest_framework.views import APIView

from base.models import City, SpecializationGroup, Institution, Skill, Country, WorkSchedule, EmploymentType, Position, \
    EmployeeCompany, Department
from base.serializers import CitySerializer, GroupedSpecializationSerializer, InstitutionSerializer, SkillSerializer, \
    CountrySerializer, PositionSerializer, EmployeeCompanySerializer, DepartmentSerializer
from base.utils.exceptions import BadRequestException
from base.utils.http import Response
from base.utils.paginators import AbstractPaginator
from users.models import UserInformation, UserEducation
from vacancies.models import Vacancy, RecruiterFlow, Interview
from vacancies.serializers import VacancyTemplateTasksSerializer, VacancyTemplateBenefitsSerializer


class BasePaginatedView(APIView):
    model = None
    queryset = None
    serializer = None
    filter = None
    search_list = []

    def get(self, request, *args, **kwargs):
        paginator = AbstractPaginator(
            model=self.model,
            model_serializer=self.serializer,
            queryset=self.queryset,
            filter_instance=self.filter,
            context={"kwargs": kwargs},
            request=request
        )

        try:
            result = paginator.get_result(search_list=self.search_list)
        except BadRequestException as error:
            return Response(
                status=status.HTTP_400_BAD_REQUEST,
                content=error.message
            )
        return Response(result)


class BaseChoiceView(APIView):
    choices = None

    def get(self, request, *args, **kwargs):
        result = []
        for key, value in self.choices:
            result.append({
                "id": key,
                "label": value
            })
        return Response(result)


class CountryView(BasePaginatedView):
    model = Country
    queryset = Country.objects.filter(is_verified=True)
    serializer = CountrySerializer
    search_list = ['name__icontains']


class CityView(BasePaginatedView):
    model = City
    queryset = City.objects.filter(is_verified=True)
    serializer = CitySerializer
    search_list = ['name__icontains']


class SpecializationView(BasePaginatedView):
    model = SpecializationGroup
    queryset = SpecializationGroup.objects.all()
    serializer = GroupedSpecializationSerializer
    search_list = ['specializations__name__icontains']


class InstitutionView(BasePaginatedView):
    model = Institution
    queryset = Institution.objects.all()
    serializer = InstitutionSerializer
    search_list = ['name__icontains']


class SkillView(BasePaginatedView):
    model = Skill
    queryset = Skill.objects.filter(is_verified=True)
    serializer = SkillSerializer
    search_list = ['name__icontains']


class PositionView(BasePaginatedView):
    model = Position
    queryset = Position.objects.filter(is_verified=True)
    serializer = PositionSerializer
    search_list = ['name__icontains']


class EmployeeCompanyView(BasePaginatedView):
    model = EmployeeCompany
    queryset = EmployeeCompany.objects.filter(is_verified=True)
    serializer = EmployeeCompanySerializer
    search_list = ['name__icontains']


class VacancyTemplateTasksView(BasePaginatedView):
    model = Vacancy
    queryset = Vacancy.objects.filter(tasks_used_as_template=True)
    serializer = VacancyTemplateTasksSerializer
    search_list = ['position__name__icontains', 'tasks__icontains']

class VacancyTemplateBenefitsView(BasePaginatedView):
    model = Vacancy
    queryset = Vacancy.objects.filter(benefits_used_as_template=True)
    serializer = VacancyTemplateBenefitsSerializer
    search_list = ['position__name__icontains', 'benefits__icontains']


class DepartmentView(BasePaginatedView):
    model = Department
    queryset = Department.objects.all()
    serializer = DepartmentSerializer
    search_list = ['name__icontains']


class SexView(BaseChoiceView):
    choices = UserInformation.Sex.choices


class WorkScheduleView(BaseChoiceView):
    choices = WorkSchedule.choices


class EmploymentTypeView(BaseChoiceView):
    choices = EmploymentType.choices


class ContactTypeView(BaseChoiceView):
    choices = UserInformation.ContactType.choices


class EducationLevelView(BaseChoiceView):
    choices = UserEducation.EducationLevel.choices


class VacancyCategoryView(BaseChoiceView):
    choices = Vacancy.VacancyCategory.choices


class VacancyStatusView(BaseChoiceView):
    choices = Vacancy.VacancyStatus.choices


class RecruiterFlowStepView(BaseChoiceView):
    choices = RecruiterFlow.Step.choices


class InterviewTypeView(BaseChoiceView):
    choices = Interview.InterviewType.choices


class InterviewStatusView(BaseChoiceView):
    choices = Interview.InterviewStatus.choices
