import io
import logging
import uuid
from dataclasses import dataclass

from PIL import Image
from django.core.exceptions import ObjectDoesNotExist
from django.core.files.uploadedfile import InMemoryUploadedFile, TemporaryUploadedFile
from django.db import IntegrityError
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.views import APIView

from base.utils.exceptions import BadRequestException, S3ConnectionError, S3DeleteError, S3DownloadError, S3UploadError
from base.utils.files import S3Wrapper
from base.utils.http import Response
from base.utils.paginators import AbstractPaginator

logger = logging.getLogger(__name__)


class AbstractCRUDView(APIView):
    """
    Абстрактный класс для CRUD-операций.
    Задайте необходимые атрибуты и переопределите методы, если это необходимо.

    Attributes:
        model: модель, с которой работает View
        id_slug: slug для идентификатора объекта
        acl_rules: правила ACL для действий
        read_serializer_class: класс для чтения
        write_serializer_class: класс для записи
        use_pagination: использовать ли пагинацию, по умолчанию True
        serializer_included_fields: поля, которые нужно включить в сериализатор
        filter_instance: фильтр для экземпляра
        search_list: список полей для поиска
        filter_kwargs: фильтры для queryset. По умолчанию {'user': kwargs.get('user')}

        queryset: queryset, с которым работает View. Является внутренним атрибутом
        instance: экземпляр модели. Является внутренним атрибутом
        object_id: идентификатор объекта. Является внутренним атрибутом
        context: контекст для сериализатора. Является внутренним атрибутом. Используйте метод get_context для
            переопределения контекста
        """
    model = None
    id_slug = None
    acl_rules = {
        "GET": None,
        "POST": None,
        "PUT": None,
        "DELETE": None
    }
    read_serializer_class = None
    write_serializer_class = None
    use_pagination = True
    serializer_included_fields = None
    filter_instance = None
    search_list = None
    filter_kwargs = None

    queryset = None
    instance = None
    object_id = None
    context = None

    # ---------------------------------- AbstractCRUDView methods ----------------------------------
    # noinspection PyMethodMayBeStatic
    def get_context(self, kwargs):
        return {'kwargs': kwargs}

    def get_instance_or_queryset(self, request, **kwargs):
        try:
            if self.object_id:
                self.instance = self.model.objects.acl(
                    function_code=self.acl_rules[request.method],
                    **kwargs).get(id=self.object_id)
                if not self.instance:
                    return Response(status=403, content=f"Действие {self.acl_rules[request.method]} запрещено")
            else:
                if request.method == 'GET':
                    self.queryset = self.model.objects.acl(
                        function_code=self.acl_rules[request.method],
                        **kwargs
                    )
        except (ObjectDoesNotExist, ValueError):
            return Response(status=404, content="Объект не найден")

    def single_response(self):
        data = self.read_serializer_class(self.instance, context=self.context).data
        return Response(data)

    def multi_response(self, request):
        if self.use_pagination:
            return self.paginated_response(request=request)
        return self.plain_multi_response()

    def paginated_response(self, request):
        try:
            paginator = AbstractPaginator(
                self.model,
                self.read_serializer_class,
                self.queryset,
                request=request,
                included_fields=self.serializer_included_fields,
                context=self.context,
                filter_instance=self.filter_instance
            )
            data = paginator.get_result(
                search_list=self.search_list,
                filter_kwargs=self.filter_kwargs
            )
        except BadRequestException as error:
            return Response(status=400, content=error.message)
        return Response(data)

    def plain_multi_response(self):
        data = self.read_serializer_class(self.queryset, many=True, context=self.context).data
        return Response(data)

    def perform_create(self, request, **kwargs):
        serializer = self.get_serializer(data=request.data, context=self.context)
        serializer.is_valid(raise_exception=True)
        instance = self.save_serializer(serializer)
        return Response({'id': instance.id}, status=201)

    def perform_update(self, request, partial=False):
        serializer = self.get_serializer(
            self.instance,
            data=request.data,
            context=self.context,
            partial=partial)
        serializer.is_valid(raise_exception=True)
        self.save_serializer(serializer)
        return Response(status=204)

    def get_serializer(self, *args, **kwargs):
        return self.write_serializer_class(*args, **kwargs)

    # noinspection PyMethodMayBeStatic
    def save_serializer(self, serializer):
        try:
            return serializer.save()
        except IntegrityError:
            return Response(
                status=400,
                content=f"Ошибка при сохранении: Возможно, объект с такими данными уже "
                        f"существует")
        except Exception as error:
            return Response(
                status=400,
                content=f"Ошибка при сохранении: {error}")

    def get_filter_kwargs(self, request, **kwargs):
        return {'user': kwargs.get('user')}

    # ---------------------------------- APIView methods ----------------------------------
    def dispatch(self, request, *args, **kwargs):
        self.object_id = kwargs.get(self.id_slug)
        self.get_instance_or_queryset(request, **kwargs)
        self.context = self.get_context(kwargs)
        self.filter_kwargs = self.get_filter_kwargs(request, **kwargs)
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        if self.object_id:
            return self.single_response()
        return self.multi_response(request)

    def post(self, request, *args, **kwargs):
        return self.perform_create(request, **kwargs)

    def put(self, request, *args, **kwargs):
        return self.perform_update(request)

    # noinspection PyUnusedLocal
    def patch(self, request, *args, **kwargs):
        return self.perform_update(request, partial=True)

    def delete(self, request, *args, **kwargs):
        self.instance.delete()
        return Response(status=204)


@dataclass
class File:
    file: str
    mime: str
    file_name: str
    file_size: int


class UploadFileSerializer(serializers.Serializer):
    file = serializers.FileField()

    def validate_file(self, file):
        # Validate that the file is not too large
        data = dict()
        data['mime'] = file.content_type
        data['file_name'] = file.name
        data['file_size'] = self.validate_file_size(file)
        data['file'] = self.handle_in_memory_file(file)
        return data

    def validate(self, data):
        # Check mime type is allowed
        self.validate_mime_type(data)
        return data

    def validate_file_size(self, file):
        size = self.context.get('size')
        file_size = file.size
        size_limit = size or 10
        if file_size > size_limit * 1024 * 1024:
            raise ValidationError(f"Файл слишком большой. Загрузите файл меньше {size_limit} МБ.")
        return file_size

    def validate_mime_type(self, data):
        allowed_mime_types = self.context.get('allowed_mime_types')
        if allowed_mime_types and data['mime'] not in allowed_mime_types:
            raise ValidationError("Недопустимый формат файла.")

    @staticmethod
    def handle_in_memory_file(file):
        if isinstance(file, InMemoryUploadedFile):
            return file.file
        elif isinstance(file, TemporaryUploadedFile):
            return file.read()
        else:
            raise ValidationError("Файл слишком большой. Загрузите файл меньше")

    def create(self, validated_data):
        return File(**validated_data['file'])


class AbstractFileView(APIView):
    """
    Абстрактный класс для загрузки файлов в S3 в поле определенной модели.

    Attributes:
        bucket_name: имя бакета
        acl_rules: правила ACL для действий
        model_class: класс модели
        id_slug: slug для идентификатора объекта
        field_name: имя поля, в которое загружается файл
        s3: экземпляр S3Wrapper. Является внутренним атрибутом
        object_instance: экземпляр модели. Является внутренним атрибутом
        object_id: идентификатор объекта. Является внутренним атрибутом
        parser_classes: классы парсеров. Является внутренним атрибутом

    Examples:
        class ProjectFileView(AbstractFileView):
            bucket_name = 'bucket_name'
            acl_rules = {
                "PUT": "R3",
                "DELETE": "R3"
            }
            model_class = Project
            id_slug = 'project_id'
            field_name = 'logo'
    """

    bucket_name: str = None
    roles = []
    model_class = None
    id_slug = None
    field_name = None

    s3 = None
    object_instance = None
    object_id = None
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def delete_file(self):
        try:
            self.s3.delete_file(getattr(self.object_instance, self.field_name))
        except S3DeleteError as error:
            logger.warning(error)

    def get_file_path(self, original_file_name):
        file_uuid = str(uuid.uuid4())
        return f"{self.object_instance.id}/{file_uuid}_{original_file_name}"

    @staticmethod
    def make_image_jpeg(orig_file_data):
        try:
            if isinstance(orig_file_data.file, io.BytesIO):
                file_bytes = Image.open(orig_file_data.file)
            else:
                file_bytes = Image.open(io.BytesIO(orig_file_data.file))
        except Exception as error:
            logger.warning(error)
            return Response(status=400, content="Некорректный файл")

        if file_bytes.mode in ("RGBA", "P"):
            file_bytes = file_bytes.convert('RGB')
        file_data = io.BytesIO()
        file_bytes.save(file_data, 'JPEG', quality=100)
        file_data.seek(0)
        return file_data

    # ---------------------------------- APIView methods ----------------------------------
    def dispatch(self, request, *args, **kwargs):
        try:
            self.s3 = S3Wrapper(bucket_name=self.bucket_name)
        except S3ConnectionError as error:
            logger.warning(error)
            return Response(
                status=400,
                content="Ошибка при соединении с сервером S3. Повторите попытку позже")

        self.object_id = kwargs.get(self.id_slug)
        if self.object_id:
            try:
                if kwargs.get('user') and kwargs.get('user').role not in self.roles:
                    return Response(
                        status=403,
                        content="Действие запрещено"
                    )
                self.object_instance = self.model_class.objects.get(id=self.object_id)
            except (ObjectDoesNotExist, ValueError):
                return Response(
                    status=404,
                    content=f"Объект не найден"
                )
        else:
            return Response(
                status=404,
                content="Не указан идентификатор объекта")
        return super().dispatch(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        data = UploadFileSerializer(data=request.FILES)
        data.is_valid(raise_exception=True)
        orig_file_data = data.save()

        file_path = self.get_file_path(orig_file_data.file_name)

        if orig_file_data.mime.split('/')[0] != 'image':
            file_data = self.make_image_jpeg(orig_file_data)
        else:
            file_data = orig_file_data.file

        try:
            self.s3.upload_file(file_path, file_data)
        except (S3UploadError, S3DownloadError) as error:
            logger.warning(error)
            return Response(status=400, content="Не удалось загрузить файл в хранилище")

        if getattr(self.object_instance, self.field_name):
            self.delete_file()

        setattr(self.object_instance, self.field_name, file_path)
        self.object_instance.save()

        return Response(status=204)

    def delete(self, request, *args, **kwargs):
        self.delete_file()
        setattr(self.object_instance, self.field_name, None)
        self.object_instance.save()
        return Response(status=204)
