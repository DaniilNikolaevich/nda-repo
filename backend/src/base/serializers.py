from django.core.exceptions import MultipleObjectsReturned, ObjectDoesNotExist
from rest_framework import serializers

from base.models import *

logger = logging.getLogger(__name__)


class ExpandFieldsMixin:
    def __init__(self, *args, **kwargs):
        # По умолчанию все поля выводятся в раскрытом виде
        self.expanded_fields = kwargs.pop('expanded_fields', '__all__')
        self.folded_fields = kwargs.pop('folded_fields', [])
        super().__init__(*args, **kwargs)

        if self.expanded_fields is None:
            self.expanded_fields = '__all__'
        if self.folded_fields is None:
            self.folded_fields = []

        if self.folded_fields == '__all__':
            fields_to_fold = self.fields.keys()
        elif self.folded_fields:
            fields_to_fold = self.folded_fields
        else:
            if self.expanded_fields == '__all__':
                fields_to_fold = []
            else:
                fields_to_fold = [field_name for field_name in self.fields.keys() if
                                  field_name not in self.expanded_fields]

        for field_name in fields_to_fold:
            field = self.fields[field_name]
            if isinstance(field, serializers.ListSerializer):
                self.fields[field_name] = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
            elif isinstance(field, serializers.BaseSerializer):
                self.fields[field_name] = serializers.PrimaryKeyRelatedField(read_only=True)


class BaseModelSerializer(ExpandFieldsMixin, serializers.ModelSerializer):

    def __init__(self, *args, **kwargs):
        self.included_fields = kwargs.pop('included_fields', None)
        self.excluded_fields = kwargs.pop('excluded_fields', None)
        super().__init__(*args, **kwargs)

        if self.included_fields is not None:
            allowed = set(self.included_fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)
        elif self.excluded_fields is not None:
            for field_name in self.excluded_fields:
                self.fields.pop(field_name)


class GeneralSerializer(BaseModelSerializer):
    class Meta:
        model = None
        fields = '__all__'

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        for key, value in representation.items():
            if isinstance(value, uuid.UUID):
                representation[key] = str(value)
            if isinstance(value, list):
                value_list = []
                for item in value:
                    value_list.append(str(item))
                representation[key] = value_list

        return representation


class AnyFieldRelatedField(serializers.PrimaryKeyRelatedField):
    default_error_messages = {
        'does_not_exist': 'Не найден объект по ключу {value}',
        'multiple_objects': 'Значение {value} не является уникальным',
        'incorrect_type': 'Некорректный тип данных',
    }

    def __init__(self, **kwargs):
        self.lookup_field = kwargs.pop('lookup_field', 'pk')
        super().__init__(**kwargs)

    def to_internal_value(self, data):
        try:
            return self.get_queryset().get(**{self.lookup_field: data})
        except ObjectDoesNotExist:
            self.fail('does_not_exist', value=data)
        except MultipleObjectsReturned:
            self.fail('multiple_objects', value=data)
        except (TypeError, ValueError):
            self.fail('incorrect_type', data_type=type(data).__name__)


class CountrySerializer(BaseModelSerializer):
    class Meta:
        model = Country
        fields = ['id', 'name', 'is_verified']


class CountryField(serializers.Field):
    def __init__(self, verified=False, **kwargs):
        self.verified = verified
        super().__init__(**kwargs)

    def to_representation(self, value):
        return CountrySerializer(value).data

    def to_internal_value(self, data):
        if not data:
            return None

        if isinstance(data, str):
            try:
                country = Country.objects.get(name=data)
                if self.verified and not country.is_verified:
                    country.is_verified = True
                    country.save()
            except ObjectDoesNotExist:
                country = Country.objects.create(name=data, is_verified=self.verified)
            return country
        raise serializers.ValidationError("Invalid input for country field")


class CitySerializer(BaseModelSerializer):
    class Meta:
        model = City
        fields = ['id', 'name', 'is_verified']


class CityField(serializers.Field):

    def __init__(self, verified=False, **kwargs):
        self.verified = verified
        super().__init__(**kwargs)

    def to_representation(self, value):
        return CitySerializer(value).data

    def to_internal_value(self, data):
        if not data:
            return None
        if isinstance(data, str):
            try:
                city = City.objects.get(name=data)
                if self.verified and not city.is_verified:
                    city.is_verified = True
                    city.save()
            except ObjectDoesNotExist:
                city = City.objects.create(name=data, is_verified=self.verified)
            return city
        raise serializers.ValidationError("Invalid input for city field")


class SkillSerializer(BaseModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'is_verified']


class SkillsField(serializers.Field):

    def __init__(self, verified=False, **kwargs):
        self.verified = verified
        super().__init__(**kwargs)

    def to_representation(self, value):
        return SkillSerializer(value, many=True).data

    def to_internal_value(self, data):
        if isinstance(data, list):
            skills = []
            for item in data:
                if not data:
                    raise serializers.ValidationError("Навык не может быть пустым")
                if isinstance(item, str):
                    try:
                        skill = Skill.objects.get(name=item)
                        if self.verified and not skill.is_verified:
                            skill.is_verified = True
                            skill.save()
                    except ObjectDoesNotExist:
                        skill = Skill.objects.create(name=item, is_verified=self.verified)
                else:
                    raise serializers.ValidationError("Invalid input for skill field")
                skills.append(skill)
            return skills
        raise serializers.ValidationError("Invalid input for skills field")


class SpecializationGroupSerializer(BaseModelSerializer):
    class Meta:
        model = SpecializationGroup
        fields = ['id', 'name']


class SpecializationSerializer(BaseModelSerializer):
    group = SpecializationGroupSerializer()

    class Meta:
        model = Specialization
        fields = ['id', 'name', 'group']


class GroupedSpecializationSerializer(BaseModelSerializer):
    specializations = serializers.SerializerMethodField()

    def get_specializations(self, obj):
        return SpecializationSerializer(obj.specializations, many=True, excluded_fields=['group']).data

    class Meta:
        model = SpecializationGroup
        fields = ['id', 'name', 'specializations']


class InstitutionSerializer(BaseModelSerializer):
    class Meta:
        model = Institution
        fields = ['id', 'name']


class EmployeeCompanySerializer(BaseModelSerializer):
    class Meta:
        model = EmployeeCompany
        fields = ['id', 'name', 'is_verified']


class EmployeeCompanyField(serializers.Field):
    def __init__(self, verified=False, **kwargs):
        self.verified = verified
        super().__init__(**kwargs)

    def to_representation(self, value):
        return EmployeeCompanySerializer(value).data

    def to_internal_value(self, data):
        if isinstance(data, str):
            if not data:
                raise serializers.ValidationError("Компания не может быть пустой")
            try:
                employee_company = EmployeeCompany.objects.get(name=data)
                if self.verified and not employee_company.is_verified:
                    employee_company.is_verified = True
                    employee_company.save()
            except ObjectDoesNotExist:
                employee_company = EmployeeCompany.objects.create(name=data, is_verified=self.verified)
            return employee_company

        raise serializers.ValidationError("Invalid input for company field")


class PositionSerializer(BaseModelSerializer):
    class Meta:
        model = Position
        fields = ['id', 'name', 'is_verified']


class PositionField(serializers.Field):

    def __init__(self, verified=False, **kwargs):
        self.verified = verified
        super().__init__(**kwargs)

    def to_representation(self, value):
        return PositionSerializer(value).data

    def to_internal_value(self, data):
        if isinstance(data, str):
            if not data:
                raise serializers.ValidationError("Должность не может быть пустой")
            try:
                position = Position.objects.get(name=data)
                if self.verified and not position.is_verified:
                    position.is_verified = True
                    position.save()
            except ObjectDoesNotExist:
                position = Position.objects.create(name=data, is_verified=self.verified)
            return position
        raise serializers.ValidationError("Invalid input for position field")


class InstitutionField(serializers.Field):
    def to_representation(self, value):
        return InstitutionSerializer(value).data

    def to_internal_value(self, data):
        if isinstance(data, str):
            if not data:
                raise serializers.ValidationError("Образовательная организация не может быть пустой")

            institution, created = Institution.objects.get_or_create(name=data)
            return institution

        raise serializers.ValidationError("Invalid input for institution field")


class DepartmentSerializer(BaseModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name']


class DepartmentField(serializers.Field):

    def to_representation(self, value):
        return DepartmentSerializer(value).data

    def to_internal_value(self, data):
        if isinstance(data, str):
            if not data:
                raise serializers.ValidationError("Отдел не может быть пустым")

            department, created = Department.objects.get_or_create(name=data)
            return department

        raise serializers.ValidationError("Invalid input for department field")
