import io
import logging
import uuid

from django.utils.decorators import method_decorator
from PIL import Image
from rest_framework import status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.views import APIView

from base.utils.api_views import UploadFileSerializer
from base.utils.decorators import log_action, tryexcept
from base.utils.exceptions import S3ConnectionError, S3DeleteError, S3DownloadError, S3UploadError
from base.utils.files import S3Wrapper
from base.utils.http import Response
from base.views import BasePaginatedView
from settings.settings import S3_USER_PHOTO_BUCKET
from users.admin_settings.filters import UserFilter
from users.admin_settings.serializers import AdminRegisterSerializer, AdminUserSerializer, \
    ReadAdminInformationSerializer, WriteAdminInformationSerializer, WriteAdminUserSerializer
from users.decorators import auth
from users.models import User

logger = logging.getLogger(__name__)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class UserView(BasePaginatedView):
    model = User
    queryset = User.objects.all()
    serializer = AdminUserSerializer
    search_list = ['email__icontains', 'first_name__icontains', 'last_name__icontains',
                   'fullname__icontains']
    filter = UserFilter

    def dispatch(self, request, *args, **kwargs):
        self.author = kwargs.get('user')
        if self.author.role not in [User.Role.RECRUITER, User.Role.ADMIN]:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        serializer = AdminRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_201_CREATED, content="Пользователю успешно выслано приглашение")


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class UserDetailView(APIView):
    model = User
    queryset = User.objects.all()
    write_serializer = WriteAdminUserSerializer
    read_serializer = AdminUserSerializer
    search_list = ['email__icontains', 'first_name__icontains', 'last_name__icontains',
                   'fullname__icontains']
    filter = UserFilter

    def dispatch(self, request, *args, **kwargs):
        self.author = kwargs.get('user')
        if self.author.role not in [User.Role.RECRUITER, User.Role.ADMIN]:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')
        user_id = kwargs.get('target_user_id')
        try:
            self.user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND, content='Пользователь не найден')
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        serializer = self.read_serializer(self.user)
        return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        data = request.data
        serializer = self.write_serializer(data=data, instance=self.user)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class AdminMyInfoView(APIView):
    model = User
    queryset = User.objects.all()
    read_serializer = ReadAdminInformationSerializer
    write_serializer = WriteAdminInformationSerializer

    def dispatch(self, request, *args, **kwargs):
        self.author = kwargs.get('user')
        if self.author.role not in [User.Role.RECRUITER, User.Role.ADMIN]:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        serializer = self.read_serializer(self.author.admin_info)
        return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        data = request.data
        serializer = self.write_serializer(data=data, instance=self.author.admin_info)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class AdminMyUserView(APIView):
    write_serializer = WriteAdminUserSerializer

    def dispatch(self, request, *args, **kwargs):
        self.author = kwargs.get('user')
        if self.author.role not in [User.Role.RECRUITER, User.Role.ADMIN]:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')
        return super().dispatch(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        data = request.data
        serializer = self.write_serializer(data=data, instance=self.author, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class AdminMyAvatarView(APIView):
    s3 = None
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def dispatch(self, request, *args, **kwargs):
        self.current_user = kwargs.get('user')
        if self.current_user.role not in [User.Role.RECRUITER, User.Role.ADMIN]:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')
        try:
            self.s3 = S3Wrapper(bucket_name=S3_USER_PHOTO_BUCKET)
        except S3ConnectionError as error:
            logger.warning(error)
            return Response(status=status.HTTP_400_BAD_REQUEST,
                            content="Ошибка при соединении с сервером S3. Повторите попытку позже")

        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        """Загрузка аватара пользователя"""

        data = UploadFileSerializer(data=request.FILES)
        data.is_valid(raise_exception=True)
        file = data.save()
        file = file.file
        avatar_uuid = str(uuid.uuid4())
        avatar_path = f"{avatar_uuid}.jpg"
        thumbnail_uuid = str(uuid.uuid4())
        thumbnail_path = f"{thumbnail_uuid}.jpg"

        # Привожу фото к JPEG формату, чтобы не волноваться про остальные виды
        try:
            if isinstance(file, io.BytesIO):
                photo = Image.open(file)
            else:
                photo = Image.open(io.BytesIO(file))
        except Exception as error:
            logger.warning(error)
            return Response(status=status.HTTP_400_BAD_REQUEST, content="Ошибка в файле фотографии")
        if photo.mode in ("RGBA", "P"):
            photo = photo.convert('RGB')
        photo_data = io.BytesIO()
        photo.save(photo_data, 'JPEG', quality=100)
        # Создаю миниатюру для фото человека
        thumbnail = Image.open(photo_data)
        max_size = (300, 400)
        thumbnail.thumbnail(max_size)
        if thumbnail.mode in ("RGBA", "P"):
            thumbnail = thumbnail.convert('RGB')
        thumbnail_data = io.BytesIO()
        thumbnail.save(thumbnail_data, 'JPEG', quality=100)
        # Нужно перекинуть байты в начало, иначе ничего не сохранится
        thumbnail_data.seek(0)
        photo_data.seek(0)

        try:
            self.s3.upload_file(avatar_path, photo_data)
        except (S3UploadError, S3DownloadError) as error:
            logger.warning(error)
            return Response(status=status.HTTP_400_BAD_REQUEST,
                            content="Не удалось загрузить фотографию. Повторите попытку позже")

        try:
            self.s3.upload_file(thumbnail_path, thumbnail_data)
        except (S3UploadError, S3DownloadError) as error:
            logger.warning(error)
            return Response(status=status.HTTP_400_BAD_REQUEST,
                            content="Не удалось загрузить фотографию. Повторите попытку позже")

        self.current_user.admin_info.avatar = avatar_uuid
        self.current_user.admin_info.avatar_thumbnail = thumbnail_uuid
        self.current_user.admin_info.save()
        return Response(
            status=status.HTTP_201_CREATED,
            content="Фотография успешно загружена"
        )

    def delete(self, request, *args, **kwargs):

        try:
            self.s3.delete_file(str(self.current_user.admin_info.avatar))
        except S3DeleteError as error:
            logger.warning(error)
        try:
            self.s3.delete_file(str(self.current_user.admin_info.avatar_thumbnail))
        except S3DeleteError as error:
            logger.warning(error)

        # Обновляю информацию в пользователе
        self.current_user.admin_info.avatar = None
        self.current_user.admin_info.avatar_thumbnail = None
        self.current_user.admin_info.save()

        return Response(status=status.HTTP_204_NO_CONTENT, content="Фотография успешно удалена")
