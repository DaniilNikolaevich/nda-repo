from rest_framework import serializers

from base.models import EmploymentType, WorkSchedule
from base.serializers import PositionField, EmployeeCompanyField, InstitutionField, SkillsField, CountryField, \
    CityField, BaseModelSerializer
from users.models import UserInformation
from users.serializer import EducationLevelField
from vacancies.models import Vacancy


class AIContactSerializer(serializers.Serializer):
    type = serializers.ChoiceField(choices=UserInformation.ContactType.choices)
    value = serializers.CharField(max_length=255)
    is_preferred = serializers.BooleanField()


class AIWorkExperienceSerializer(serializers.Serializer):
    company = EmployeeCompanyField(allow_null=True)
    department = serializers.CharField(max_length=255, allow_null=True)
    position = PositionField(allow_null=True)
    start_date = serializers.DateField(allow_null=True)
    end_date = serializers.DateField(allow_null=True)
    duties = serializers.CharField(allow_null=True)
    achievements = serializers.CharField(allow_null=True)


class AIEducationSerializer(serializers.Serializer):
    institution = InstitutionField(allow_null=True)
    start_date = serializers.DateField(allow_null=True)
    end_date = serializers.DateField(allow_null=True)
    faculty = serializers.CharField(max_length=255, allow_null=True)
    speciality = serializers.CharField(max_length=255, allow_null=True)
    education_level = EducationLevelField()


class AICVSerializer(serializers.Serializer):
    sex = serializers.ChoiceField(choices=UserInformation.Sex)
    date_of_birth = serializers.DateField(allow_null=True, required=False)
    country = CountryField(allow_null=True, required=False)
    city = CityField(allow_null=True, required=False)
    contacts = AIContactSerializer(allow_null=True, many=True, required=False)
    about = serializers.CharField(allow_null=True, required=False)
    ai_summary = serializers.CharField(allow_null=True, required=False)
    personalized_questions = serializers.ListField(child=serializers.CharField(), allow_null=True, required=False)
    relocation = serializers.BooleanField(allow_null=True, required=False)
    business_trips = serializers.BooleanField(allow_null=True, required=False)
    employment_type = serializers.ListField(
        child=serializers.ChoiceField(choices=EmploymentType.choices),
        allow_null=True,
        required=False
    )
    work_schedule = serializers.ListField(
        child=serializers.ChoiceField(choices=WorkSchedule.choices),
        allow_null=True,
        required=False
    )
    preferred_position = PositionField(allow_null=True, required=False)
    preferred_salary = serializers.IntegerField(allow_null=True, required=False)
    skills = SkillsField(allow_null=True, required=False)
    work_experience = AIWorkExperienceSerializer(allow_null=True, required=False, many=True)
    total_experience = serializers.IntegerField(allow_null=True, required=False)
    education = AIEducationSerializer(allow_null=True, required=False, many=True)


class AIVacancySerializer(BaseModelSerializer):
    position = serializers.SerializerMethodField()
    skills = serializers.SerializerMethodField()

    def get_position(self, obj):
        return obj.position.name if obj.position else None

    def get_skills(self, obj):
        return list(obj.skills.all().values_list('name', flat=True))

    class Meta:
        model = Vacancy
        fields = (
            'id',
            'position',
            'description',
            'skills',
            'salary',
            'tasks',
            'additional_requirements',
        )


class AIUserInformationSerializer(BaseModelSerializer):
    id = serializers.SerializerMethodField()
    preferred_position = serializers.SerializerMethodField()
    skills = serializers.SerializerMethodField()

    def get_id(self, obj):
        return str(obj.user.id)

    def get_preferred_position(self, obj):
        return obj.preferred_position.name if obj.preferred_position else None

    def get_skills(self, obj):
        return list(obj.skills.all().values_list('name', flat=True))

    class Meta:
        model = UserInformation
        fields = (
            'id',
            'preferred_position',
            'preferred_salary',
            'skills',
            'ai_summary'
        )
