from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from base.serializers import BaseModelSerializer
from users.models import AdminInformation, User
from users.serializer import UserSerializer


class AdminUserSerializer(BaseModelSerializer):
    role = serializers.SerializerMethodField()
    avatar_thumbnail_url = serializers.SerializerMethodField()
    recruiter_info = serializers.SerializerMethodField()

    def get_recruiter_info(self, obj):
        if obj.role in [User.Role.RECRUITER, User.Role.ADMIN]:
            return ReadRecruiterSerializer(obj.admin_info, excluded_fields=['user']).data

    def get_avatar_thumbnail_url(self, obj):
        if obj.role in [User.Role.RECRUITER, User.Role.ADMIN]:
            return obj.admin_info.avatar_thumbnail_url
        else:
            return obj.info.avatar_thumbnail_url

    def get_role(self, obj):
        return {"id": obj.role, "name": obj.get_role_display()}

    class Meta:
        model = User
        fields = [
            'id', 'email', 'name', 'surname', 'patronymic', 'fullname',
            'role', 'is_active', 'is_registered', 'avatar_thumbnail_url', 'recruiter_info'
        ]


class WriteAdminUserSerializer(BaseModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'name',
                  'surname', 'patronymic',
                  'role',
                  'is_active', 'is_registered']


class ReadRecruiterSerializer(BaseModelSerializer):
    user = UserSerializer(included_fields=['id', 'name', 'surname', 'patronymic', 'fullname'])

    class Meta:
        model = AdminInformation
        fields = ['user', 'email', 'position',
                  'department', 'phone', 'avatar_url', 'avatar_thumbnail_url']


class ReadAdminInformationSerializer(BaseModelSerializer):
    user = UserSerializer(included_fields=['id', 'name', 'surname', 'patronymic', 'fullname'])

    class Meta:
        model = AdminInformation
        fields = ['user', 'email', 'position',
                  'department', 'external_calendar_type', 'phone', 'avatar_url', 'avatar_thumbnail_url',
                  'external_calendar_url',
                  'max_slots']


class WriteAdminInformationSerializer(BaseModelSerializer):
    class Meta:
        model = AdminInformation
        fields = ['email', 'position',
                  'department', 'phone', 'external_calendar_url', 'max_slots']


class AdminRegisterSerializer(BaseModelSerializer):
    class Meta:
        model = User
        fields = ["email", "surname", "name", "patronymic"]

    def validate_email(self, value):
        if not value:
            raise ValidationError("Поле email не может быть пустым")

        if User.objects.filter(email=value, is_registered=True).exists():
            raise ValidationError("Пользователь с таким email уже существует")
        return value

    def create(self, validated_data):
        email = validated_data.get('email')
        validated_data['role'] = User.Role.RECRUITER
        user = User.objects.create(**validated_data)
        user.send_verification_link(email)
        return user
