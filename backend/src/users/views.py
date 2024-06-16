import io
import logging
import uuid

from PIL import Image
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.utils.decorators import method_decorator
from rest_framework import status
from rest_framework.parsers import MultiPartParser, JSONParser, FormParser
from rest_framework.views import APIView
from weasyprint import HTML

from base.utils.api_views import UploadFileSerializer
from base.utils.decorators import tryexcept, log_action
from base.utils.exceptions import S3ConnectionError, S3UploadError, S3DownloadError, S3DeleteError, BadRequestException
from base.utils.files import S3Wrapper
from base.utils.http import Response
from base.utils.paginators import AbstractPaginator
from settings.settings import S3_USER_PHOTO_BUCKET
from users.decorators import auth
from users.exceptions import RefreshTokenError
from users.models import UserInformation, User, UserComment
from users.serializer import RegisterSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer, \
    SetPasswordSerializer, SignInSerializer, RefreshTokenSerializer, UserInformationSerializer, \
    UserWorkExperienceSerializer, UserEducationSerializer, UserCommentWriteSerializer, \
    UserCommentReadSerializer

logger = logging.getLogger(__name__)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class TestView(APIView):
    def get(self, request, user, *args, **kwargs):
        return Response(content="Hello, World!")


class SignInView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = SignInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token_dict = serializer.get_token_pair()
        return Response(status=status.HTTP_200_OK, content=token_dict)


class RefreshTokenView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = RefreshTokenSerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except RefreshTokenError:
            return Response(
                status=status.HTTP_401_UNAUTHORIZED,
                content="Срок действия токена истек. Войдите в систему заново"
            )
        token_dict = serializer.get_new_access_token()
        return Response(status=status.HTTP_200_OK, content=token_dict)


class RegisterView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            status=status.HTTP_201_CREATED,
            content="Письмо для задания пароля отправлено на вашу почту"
        )


class SetPasswordView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = SetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(content="Пароль успешно задан")


class PasswordResetView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(content="Письмо для сброса пароля отправлено на вашу почту")


class PasswordResetConfirmView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(content="Пароль успешно изменен")


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class MyInformationView(APIView):
    def get(self, request, *args, user, **kwargs):
        serializer = UserInformationSerializer(user.info, excluded_fields=['recruiter_note', 'ai_summary',
                                                                           'personalized_questions'])
        return Response(
            status=status.HTTP_200_OK,
            content=serializer.data,
        )

    def put(self, request, *args, user, **kwargs):
        with transaction.atomic():
            serializer = UserInformationSerializer(user.info, data=request.data,
                                                   excluded_fields=['recruiter_note', 'personalized_questions'])
            serializer.is_valid(raise_exception=True)
            serializer.save()
        return Response(
            status=status.HTTP_204_NO_CONTENT,
            content="Информация успешно обновлена"
        )

    def patch(self, request, *args, user, **kwargs):
        with transaction.atomic():
            serializer = UserInformationSerializer(user.info, data=request.data, partial=True,
                                                   excluded_fields=['recruiter_note', 'personalized_questions'])
            serializer.is_valid(raise_exception=True)
            serializer.save()
        return Response(
            status=status.HTTP_204_NO_CONTENT,
            content="Информация успешно обновлена"
        )


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class UserInformationView(APIView):
    user_info = None

    def dispatch(self, request, *args, **kwargs):
        user_id = kwargs.get('target_user_id')
        try:
            self.user_info = UserInformation.objects.get(user=user_id)
        except ObjectDoesNotExist:
            return Response(
                status=status.HTTP_404_NOT_FOUND,
                content="Информация о пользователе не найдена"
            )
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        serializer = UserInformationSerializer(self.user_info)
        return Response(status=status.HTTP_200_OK, content=serializer.data)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class MyProfileOccupancy(APIView):
    def get(self, request, user, *args, **kwargs):
        return Response(status=status.HTTP_200_OK, content=user.info.get_profile_occupancy())


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class UserProfileOccupancy(APIView):
    def get(self, request, *args, **kwargs):
        try:
            user = User.objects.get(id=kwargs.get('target_user_id'))
        except ObjectDoesNotExist:
            return Response(
                status=status.HTTP_404_NOT_FOUND,
                content="Пользователь не найден"
            )
        return Response(status=status.HTTP_200_OK, content=user.info.get_profile_occupancy())


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class UserAvatarView(APIView):
    s3 = None
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def dispatch(self, request, *args, **kwargs):
        try:
            self.s3 = S3Wrapper(bucket_name=S3_USER_PHOTO_BUCKET)
        except S3ConnectionError as error:
            logger.warning(error)
            return Response(status=status.HTTP_400_BAD_REQUEST,
                            content="Ошибка при соединении с сервером S3. Повторите попытку позже")

        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        """Загрузка аватара пользователя"""
        current_user = kwargs.get('user')

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

        current_user.info.avatar = avatar_uuid
        current_user.info.avatar_thumbnail = thumbnail_uuid
        current_user.info.save()
        return Response(
            status=status.HTTP_201_CREATED,
            content="Фотография успешно загружена"
        )

    def delete(self, request, *args, **kwargs):
        current_user = kwargs.get('user')

        try:
            self.s3.delete_file(str(current_user.info.avatar))
        except S3DeleteError as error:
            logger.warning(error)
        try:
            self.s3.delete_file(str(current_user.info.avatar_thumbnail))
        except S3DeleteError as error:
            logger.warning(error)

        # Обновляю информацию в пользователе
        current_user.info.avatar = None
        current_user.info.avatar_thumbnail = None
        current_user.info.save()

        return Response(status=status.HTTP_204_NO_CONTENT, content="Фотография успешно удалена")


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class MyWorkExperienceView(APIView):
    def get(self, request, user, *args, **kwargs):
        queryset = user.work_experience.all().order_by('end_date')
        serializer = UserWorkExperienceSerializer(queryset, many=True)
        return Response(status=status.HTTP_200_OK, content=serializer.data)

    def post(self, request, user, *args, **kwargs):
        with transaction.atomic():
            serializer = UserWorkExperienceSerializer(data=request.data, many=True)
            serializer.is_valid(raise_exception=True)
            queryset = UserWorkExperienceSerializer.bulk_create(user, serializer.validated_data)

        return Response(status=status.HTTP_200_OK, content=UserWorkExperienceSerializer(queryset, many=True).data)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class UserWorkExperienceView(APIView):
    target_user = None

    def dispatch(self, request, *args, **kwargs):
        try:
            self.target_user = User.objects.get(id=kwargs.get('target_user_id'))
        except ObjectDoesNotExist:
            return Response(
                status=status.HTTP_404_NOT_FOUND,
                content="Пользователь не найден"
            )
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        queryset = self.target_user.work_experience.all().order_by('end_date')
        serializer = UserWorkExperienceSerializer(queryset, many=True)
        return Response(status=status.HTTP_200_OK, content=serializer.data)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class MyEducationView(APIView):
    def get(self, request, user, *args, **kwargs):
        queryset = user.education.all().order_by('end_date')
        serializer = UserEducationSerializer(queryset, many=True)
        return Response(status=status.HTTP_200_OK, content=serializer.data)

    def post(self, request, user, *args, **kwargs):
        with transaction.atomic():
            serializer = UserEducationSerializer(data=request.data, many=True)
            serializer.is_valid(raise_exception=True)
            queryset = UserEducationSerializer.bulk_create(user, serializer.validated_data)

        return Response(status=status.HTTP_200_OK, content=UserEducationSerializer(queryset, many=True).data)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class UserEducationView(APIView):
    target_user = None

    def dispatch(self, request, *args, **kwargs):
        try:
            self.target_user = User.objects.get(id=kwargs.get('target_user_id'))
        except ObjectDoesNotExist:
            return Response(
                status=status.HTTP_404_NOT_FOUND,
                content="Пользователь не найден"
            )
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        queryset = self.target_user.education.all().order_by('end_date')
        serializer = UserEducationSerializer(queryset, many=True)
        return Response(status=status.HTTP_200_OK, content=serializer.data)


# ----------------------------- НОВЫЕ АПИШКИ -----------------------------

@method_decorator([tryexcept, auth, log_action], name='dispatch')
class UserCommentView(APIView):
    target_user = None
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def dispatch(self, request, *args, **kwargs):
        current_user = kwargs.get('user')
        if not current_user.is_staff:
            return Response(
                status=status.HTTP_403_FORBIDDEN,
                content="Доступ запрещен"
            )

        user_id = kwargs.get('user_id')
        try:
            self.target_user = User.objects.get(id=user_id)
        except ObjectDoesNotExist:
            return Response(
                status=status.HTTP_404_NOT_FOUND,
                content="Пользователь не найден"
            )
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        try:
            paginator = AbstractPaginator(
                model=UserComment,
                model_serializer=UserCommentReadSerializer,
                queryset=self.target_user.comments.all(),
                context={"kwargs": kwargs},
                request=request)
            result = paginator.get_result(search_list=['text__icontains'])
        except BadRequestException as error:
            return Response(
                status=status.HTTP_400_BAD_REQUEST,
                content=error.message
            )
        return Response(result)

    def post(self, request, *args, **kwargs):
        author = kwargs.get('user')
        user = self.target_user

        mutable_data = request.data.copy()
        mutable_data['author'] = str(author.id)
        mutable_data['user'] = str(user.id)

        serializer = UserCommentWriteSerializer(data=mutable_data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=self.target_user)
        return Response(
            status=status.HTTP_201_CREATED,
            content="Комментарий успешно добавлен"
        )


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class UserCommentDetailView(APIView):
    comment = None

    def dispatch(self, request, *args, **kwargs):
        current_user = kwargs.get('user')
        if not current_user.is_staff:
            return Response(
                status=status.HTTP_403_FORBIDDEN,
                content="Доступ запрещен"
            )

        comment_id = kwargs.get('comment_id')
        try:
            self.comment = UserComment.objects.get(id=comment_id)
        except ObjectDoesNotExist:
            return Response(
                status=status.HTTP_404_NOT_FOUND,
                content="Комментарий не найден"
            )
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        serializer = UserCommentReadSerializer(self.comment)
        return Response(serializer.data)

    def delete(self, request, *args, **kwargs):
        self.comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT, content="Комментарий успешно удален")


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class UserCVView(APIView):
    target_user = None

    def dispatch(self, request, *args, **kwargs):
        current_user = kwargs.get('user')
        if not current_user.is_staff:
            return Response(
                status=status.HTTP_403_FORBIDDEN,
                content="Доступ запрещен"
            )

        try:
            self.target_user = User.objects.get(id=kwargs.get('target_user_id'))
        except ObjectDoesNotExist:
            return Response(
                status=status.HTTP_404_NOT_FOUND,
                content="Пользователь не найден"
            )

        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        user_info = self.target_user.info
        work_experience = self.target_user.work_experience.all()
        education = self.target_user.education.all()

        # HTML template rendering
        html_string = render_to_string('user_cv_template.html', {
            'user': self.target_user,
            'user_info': user_info,
            'work_experience': work_experience,
            'education': education
        })

        # Generating PDF
        pdf_file = HTML(string=html_string).write_pdf()

        response = HttpResponse(pdf_file, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{self.target_user.fullname}_cv.pdf"'
        return response


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class MyCVView(APIView):
    def get(self, request, user, *args, **kwargs):
        user_info = user.info
        work_experience = user.work_experience.all()
        education = user.education.all()

        # HTML template rendering
        html_string = render_to_string('user_cv_template.html', {
            'user': user,
            'user_info': user_info,
            'work_experience': work_experience,
            'education': education
        })

        # Generating PDF
        pdf_file = HTML(string=html_string).write_pdf()

        response = HttpResponse(pdf_file, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{user.fullname}_cv.pdf"'
        return response
