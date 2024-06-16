import logging

from django.contrib.auth.hashers import make_password
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from base.models import WorkSchedule, EmploymentType
from base.serializers import BaseModelSerializer, CityField, SkillsField, EmployeeCompanyField, PositionField, \
    InstitutionField, CountryField
from base.utils.helpers import is_valid_phone
from settings.settings import USER_TELEGRAM_BOT_USERNAME
from users.models import User, UserEducation, UserInformation, UserWorkExperience, VerificationCode, UserComment
from users.services import generate_access_token, generate_refresh_token, verify_refresh_token

logger = logging.getLogger(__name__)


def validate_password(plaintext_password):
    password_length = 7
    if len(plaintext_password) < password_length + 1:
        raise ValidationError(f"Пароль должен быть длиннее {password_length} символов")
    return make_password(plaintext_password)


# def validate(self, attrs):
#     password = self.initial_data.get("password")
#     password_confirm = self.initial_data.get("password_confirm")
#     if password != password_confirm:
#         raise ValidationError("Пароли не совпадают")
#     return attrs


class SignInSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        try:
            user = User.objects.get(email=email, is_registered=True)
        except ObjectDoesNotExist:
            raise ValidationError("Неверные учетные данные")
        if not user.is_active:
            raise ValidationError("Пользователь заблокирован")
        if not user.check_password(password):
            raise ValidationError("Неверные учетные данные")
        self.context["user"] = user
        return attrs

    def get_token_pair(self):
        user = self.context["user"]
        access_token, access_token_expires_in = generate_access_token(user)
        refresh_token, refresh_token_expires_in = generate_refresh_token(user)
        return {
            "access_token": access_token,
            "access_token_expires_in": access_token_expires_in,
            "refresh_token": refresh_token,
            "refresh_token_expires_in": refresh_token_expires_in
        }


class RefreshTokenSerializer(serializers.Serializer):
    refresh_token = serializers.CharField()

    def validate_refresh_token(self, value):
        user, refresh_token_valid_until = verify_refresh_token(value)
        self.context["user"] = user
        self.context["refresh_token_valid_until"] = refresh_token_valid_until
        return value

    def get_new_access_token(self):
        user = self.context["user"]
        refresh_token_valid_until = self.context["refresh_token_valid_until"]
        access_token, access_token_expires_in = generate_access_token(user, exp_not_before=refresh_token_valid_until)
        return {
            "access_token": access_token,
            "access_token_expires_in": access_token_expires_in
        }


class RegisterSerializer(BaseModelSerializer):
    cv_file = serializers.FileField(required=False, write_only=True)

    class Meta:
        model = User
        fields = ["name", "surname", "patronymic", "email", "cv_file"]

    def validate_name(self, value):
        name = value.strip().capitalize()
        return name

    def validate_surname(self, value):
        surname = value.strip().capitalize()
        return surname

    def validate_patronymic(self, value):
        if value is None:
            return None
        patronymic = value.strip().capitalize()
        return patronymic

    def validate_email(self, value):
        if not value:
            raise ValidationError("Поле email не может быть пустым")

        if User.objects.filter(email=value, is_registered=True).exists():
            raise ValidationError("Пользователь с таким email уже существует")
        return value

    def validate_cv_file(self, value):
        if value is None:
            return None
        if value.size > 1 * 1024 * 1024:
            raise ValidationError("Файл слишком большой. Максимальный размер файла 1 МБ")

        file_extension = value.name.split('.')[-1]
        if file_extension != "pdf":
            raise ValidationError("Недопустимый формат файла. Допустимые форматы: pdf, doc, docx, odt, rtf, txt")

        return value

    def create(self, validated_data):
        from users.tasks import process_user_cv

        email = validated_data.get('email')
        cv_file = validated_data.pop('cv_file', None)
        user = User.objects.create(**validated_data)
        user.send_verification_link(email)
        if cv_file:
            print("cv_file", cv_file, type(cv_file))
            user.info.save_cv_file(cv_file)
            process_user_cv.apply_async(kwargs={"user_id": str(user.id)})
        return user


class SetPasswordSerializer(serializers.Serializer):
    verification_code = serializers.CharField()
    password = serializers.CharField(validators=[validate_password])
    password_confirm = serializers.CharField()

    def validate_verification_code(self, value):
        try:
            verification_code = VerificationCode.objects.get(
                code=value,
                verification_type=VerificationCode.VerificationType.SET_PASSWORD
            )
        except ObjectDoesNotExist:
            raise ValidationError("Код подтверждения не найден")

        if verification_code.is_expired():
            raise ValidationError("Код подтверждения просрочен")

        if verification_code.is_used:
            raise ValidationError("Код подтверждения уже использован")

        if User.objects.filter(email=verification_code.email, is_registered=True).exists():
            raise ValidationError(f"Пользователь с Email {verification_code.email} уже зарегистрирован")

        return verification_code

    def validate(self, attrs):
        password = self.initial_data.get("password")
        password_confirm = self.initial_data.get("password_confirm")
        if password != password_confirm:
            raise ValidationError("Пароли не совпадают")
        return attrs

    def create(self, validated_data):
        verification_code = validated_data["verification_code"]
        password = validated_data["password"]
        return verification_code.complete_registration(password)


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value, is_active=True)
        except ObjectDoesNotExist:
            raise ValidationError("Неверные учетные данные")
        self.context["user"] = user
        return value

    def create(self, validated_data):
        user = self.context["user"]
        user.send_password_reset_link()
        return user


class PasswordResetConfirmSerializer(serializers.Serializer):
    verification_code = serializers.CharField()
    password = serializers.CharField(validators=[validate_password])
    password_confirm = serializers.CharField()

    def validate_verification_code(self, value):
        try:
            verification_code = VerificationCode.objects.get(
                code=value,
                verification_type=VerificationCode.VerificationType.PASSWORD_RESET
            )
        except ObjectDoesNotExist:
            raise ValidationError("Код подтверждения не найден")

        if verification_code.is_expired():
            raise ValidationError("Код подтверждения просрочен")

        if verification_code.is_used:
            raise ValidationError("Код подтверждения уже использован")

        return verification_code

    def validate(self, attrs):
        password = self.initial_data.get("password")
        password_confirm = self.initial_data.get("password_confirm")
        if password != password_confirm:
            raise ValidationError("Пароли не совпадают")
        return attrs

    def create(self, validated_data):
        verification_code = validated_data["verification_code"]
        password = validated_data["password"]
        verification_code.complete_password_reset(password)
        return verification_code.user


class UserSerializer(BaseModelSerializer):
    role = serializers.SerializerMethodField()
    avatar_thumbnail_url = serializers.SerializerMethodField()

    def get_avatar_thumbnail_url(self, obj):
        if obj.role == User.Role.CANDIDATE:
            return obj.info.avatar_thumbnail_url
        else:
            return obj.admin_info.avatar_thumbnail_url

    def get_role(self, obj):
        return {"id": obj.role, "name": obj.get_role_display()}

    class Meta:
        model = User
        fields = ['id', 'name', 'surname', 'patronymic', 'fullname', 'role', 'email', 'avatar_thumbnail_url']


class CandidateSerializer(UserSerializer):
    info = serializers.SerializerMethodField()

    def get_info(self, obj):
        if not obj.info:
            return None
        return UserInformationSerializer(obj.info, excluded_fields=['user']).data

    class Meta:
        model = User
        fields = ['id', 'name', 'surname', 'patronymic', 'fullname', 'role', 'email', 'avatar_thumbnail_url', 'info']


class SexField(serializers.Field):
    def to_representation(self, value):
        name = UserInformation.Sex(value).label
        return {"id": value, "name": name}

    def to_internal_value(self, data):
        if data is None:
            return UserInformation.Sex.NONE
        elif isinstance(data, int):
            if data in UserInformation.Sex.values:
                return data
        raise serializers.ValidationError("Invalid input for sex field")


class WorkScheduleField(serializers.Field):
    def to_representation(self, value):
        name = WorkSchedule(value).label
        return {"id": value, "name": name}

    def to_internal_value(self, data):
        if data is None:
            raise serializers.ValidationError("Work schedule field cannot be empty")
        elif isinstance(data, int):
            if data in WorkSchedule.values:
                return data
        raise serializers.ValidationError("Invalid input for work_schedule field")


class PreferredWorkScheduleField(serializers.Field):
    def to_representation(self, values):
        preferred_work_schedules = []
        for value in values:
            name = WorkSchedule(value).label
            preferred_work_schedules.append({"id": value, "name": name})
        return preferred_work_schedules

    def to_internal_value(self, data):
        if data is None or not data:
            return []
        elif isinstance(data, list):
            for item in data:
                if item not in WorkSchedule.values:
                    raise serializers.ValidationError("Invalid input for preferred_work_schedule field")
        return data


class PreferredEmploymentTypeField(serializers.Field):
    def to_representation(self, values):
        preferred_employment_type = []
        for value in values:
            name = EmploymentType(value).label
            preferred_employment_type.append({"id": value, "name": name})
        return preferred_employment_type

    def to_internal_value(self, data):
        if data is None or not data:
            return []
        elif isinstance(data, list):
            for item in data:
                if item not in EmploymentType.values:
                    raise serializers.ValidationError("Invalid input for preferred_employment_type field")
        return data


class EmploymentTypeField(serializers.Field):
    def to_representation(self, value):
        name = EmploymentType(value).label
        return {"id": value, "name": name}

    def to_internal_value(self, data):
        if data is None:
            raise serializers.ValidationError("Employment type field cannot be empty")
        elif isinstance(data, int):
            if data in EmploymentType.values:
                return data
        raise serializers.ValidationError("Invalid input for employment_type field")


class UserInformationSerializer(BaseModelSerializer):
    user = UserSerializer(read_only=True)
    sex = SexField(required=False)
    preferred_work_schedule = PreferredWorkScheduleField(required=False)
    preferred_employment_type = PreferredEmploymentTypeField(required=False)
    country = CountryField(required=False, allow_null=True)
    city = CityField(required=False, allow_null=True)
    skills = SkillsField(required=False)
    preferred_position = PositionField(required=False)
    telegram_accept_url = serializers.SerializerMethodField()

    class Meta:
        model = UserInformation
        fields = [
            'id', 'user', 'sex', 'birth_date', 'country', 'city', 'contacts', 'about', 'ai_summary',
            'preferred_work_schedule', 'business_trip', 'relocation', 'personalized_questions',
            'preferred_employment_type', 'preferred_position', 'preferred_salary',
            'skills', 'avatar_url', 'cv_url', 'avatar_thumbnail_url', 'recruiter_note',
            'telegram_accept_url', 'total_experience'
        ]
        read_only_fields = [
            'user', 'ai_summary', 'avatar_url', 'avatar_thumbnail_url',
            'cv_url', 'total_experience'
        ]

    def get_telegram_accept_url(self, obj):
        if not obj.telegram_chat_id:
            return f"https://t.me/{USER_TELEGRAM_BOT_USERNAME}?start={obj.user.id}"
        else:
            return None

    def validate_phone(self, value):
        if not value:
            return None
        is_valid, phone = is_valid_phone(value)
        if not is_valid:
            raise ValidationError("Неверный формат номера телефона")
        return phone

    def update(self, instance, validated_data):
        skills_data = validated_data.pop('skills', [])

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.skills.set(skills_data)
        instance.save()
        return instance


class UserWorkExperienceSerializer(BaseModelSerializer):
    company = EmployeeCompanyField()
    position = PositionField()

    class Meta:
        model = UserWorkExperience
        fields = ['id', 'company', 'position', 'start_date', 'end_date', 'duties', 'achievements']

    def validate_start_date(self, value):
        if value is None:
            raise ValidationError("Дата начала работы не может быть пустой")
        if value > timezone.now().date():
            raise ValidationError("Дата начала работы не может быть в будущем")
        return value

    def validate_end_date(self, value):
        if value is None:
            return value
        if value > timezone.now().date():
            raise ValidationError("Дата окончания работы не может быть в будущем")
        return value

    def validate(self, attrs):
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        if start_date and end_date and start_date > end_date:
            raise ValidationError("Дата начала работы не может быть позже даты окончания работы")
        return attrs

    @staticmethod
    def bulk_create(user, validated_data_list):
        # Удаляю старые данные о местах работы пользователя
        user.work_experience.all().delete()
        instances = []
        for work_experience in validated_data_list:
            work_experience['user'] = user
            instances.append(UserWorkExperience.objects.create(**work_experience))
        return instances


class EducationLevelField(serializers.Field):
    def to_representation(self, value):
        name = UserEducation.EducationLevel(value).label
        return {"id": value, "name": name}

    def to_internal_value(self, data):
        if data is None:
            return None
        elif isinstance(data, int):
            if data in UserEducation.EducationLevel.values:
                return data
        raise serializers.ValidationError("Invalid input for education_level field")


class UserEducationSerializer(BaseModelSerializer):
    institution = InstitutionField()
    education_level = EducationLevelField()

    class Meta:
        model = UserEducation
        fields = ['id', 'institution', 'start_date', 'end_date', 'faculty', 'speciality', 'education_level']

    def validate_start_date(self, value):
        if value is None:
            raise ValidationError("Дата начала обучения не может быть пустой")
        if value > timezone.now().date():
            raise ValidationError("Дата начала обучения не может быть в будущем")
        return value

    def validate_end_date(self, value):
        if value is None:
            return value
        if value > timezone.now().date():
            raise ValidationError("Дата окончания обучения не может быть в будущем")
        return value

    def validate(self, attrs):
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        if start_date and end_date and start_date > end_date:
            raise ValidationError("Дата начала обучения не может быть позже даты окончания работы")
        return attrs

    @staticmethod
    def bulk_create(user, validated_data_list):
        # Удаляю старые данные о местах работы пользователя
        user.education.all().delete()
        instances = []
        for education in validated_data_list:
            education['user'] = user
            instances.append(UserEducation.objects.create(**education))
        return instances


class UserCommentWriteSerializer(BaseModelSerializer):
    file = serializers.FileField(required=False, write_only=True)

    class Meta:
        model = UserComment
        fields = ['id', 'user', 'author', 'text', 'file', 'created_at', 'updated_at']

    def validate_file(self, value):
        if value is None:
            return None
        if value.size > 1 * 1024 * 1024:
            raise ValidationError("Файл слишком большой. Максимальный размер файла 1 МБ")

        file_extension = value.name.split('.')[-1]
        if file_extension not in ["pdf", "docx", "txt"]:
            raise ValidationError("Недопустимый формат файла. Допустимые форматы: pdf, docx, txt")

        return value

    def create(self, validated_data):
        file = validated_data.pop('file', None)
        comment = UserComment.objects.create(**validated_data)
        if file:
            comment.save_comment_file(file)
        return comment


class UserCommentReadSerializer(BaseModelSerializer):
    user = UserSerializer(read_only=True)
    author = UserSerializer(read_only=True)

    class Meta:
        model = UserComment
        fields = ['id', 'user', 'author', 'text', 'file_url', 'created_at', 'updated_at']
