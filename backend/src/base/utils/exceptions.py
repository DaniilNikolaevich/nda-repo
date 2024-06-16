import logging

from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.views import exception_handler

from settings.settings import DEBUG

logger = logging.getLogger(__name__)


class NonFieldError(APIException):
    status_code = 400
    default_detail = 'Некорректные данные'
    default_code = 'invalid'

    def __init__(self, detail=None, code=None, status_code=None):
        if detail is None:
            detail = self.default_detail
        if code is None:
            code = self.default_code
        self.detail = {'non_field_errors': [detail]}
        self.code = code
        if status_code:
            self.status_code = status_code


class FieldError(APIException):
    status_code = 400
    default_detail = 'Некорректные данные'
    default_code = 'invalid'

    def __init__(self, field, detail=None, code=None, status_code=None):
        if detail is None:
            detail = self.default_detail
        if code is None:
            code = self.default_code
        self.detail = {field: [detail]}
        self.code = code
        if status_code:
            self.status_code = status_code


class SerializerSaveError(APIException):
    status_code = 400
    default_detail = 'Произошла ошибка при попытке сохранения объекта'
    default_code = 'service_save_error'


def api_exception_handler(exc, context=None):
    from base.utils.http import Response
    exception_response = exception_handler(exc, context)
    errors = exception_response.data if exception_response else None
    if errors is None:
        logger.warning(exc)
        message = str(exc)
        if DEBUG:
            return None
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST, content={"message": message})

    if isinstance(errors, dict):
        detail = errors.get("detail")
        non_fields_errors = errors.get("non_field_errors")
        if detail is None and non_fields_errors is None:
            message = "Ошибка валидации полей"
        else:
            message = detail or non_fields_errors[0]
        errors = [errors]
    elif isinstance(errors, list):
        detail = errors[0].get("detail")
        non_fields_errors = errors[0].get("non_field_errors")
        if detail is None and non_fields_errors is None:
            message = "Ошибка валидации полей"
        else:
            message = detail or non_fields_errors[0]
    else:
        message = str(errors)
    status_code = exception_response.status_code if (
            exception_response and exception_response.status_code // 100 != 5) else 400
    return Response(status=status_code, content={"message": message, "errors": errors})


class BaseAppException(Exception):
    def __init__(self, message="Произошла внутренняя ошибка"):
        self.message = message
        super().__init__(self.message)

    def __str__(self):
        return f"{self.message}"


class AuthenticationError(BaseAppException):
    def __init__(self, message, status_code):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

    def __str__(self):
        return f"{self.message} {self.status_code}"

class BadRequestException(BaseAppException):
    def __init__(self, message="Ошибка в данных запроса"):
        self.message = message
        super().__init__(self.message)

    def __str__(self):
        return f"{self.message}"


class BaseS3Exception(BaseAppException):
    def __init__(self, message="Произошла внутренняя ошибка при работе с S3"):
        self.message = message
        super().__init__(self.message)

    def __str__(self):
        return f"{self.message}"


class S3ConnectionError(BaseS3Exception):
    def __init__(self, message="Неизвестная ошибка"):
        self.message = f"Произошла ошибка при попытке обращения к сервису S3: {message}"
        super().__init__(self.message)

    def __str__(self):
        return f"{self.message}"


class S3UploadError(BaseS3Exception):
    def __init__(self, message="Неизвестная ошибка"):
        self.message = f"Произошла ошибка при попытке загрузки файла на S3: {message}"
        super().__init__(self.message)

    def __str__(self):
        return f"{self.message}"


class S3DownloadError(BaseS3Exception):
    def __init__(self, message="Неизвестная ошибка"):
        self.message = f"Произошла ошибка при попытке скачивания файла с S3: {message}"
        super().__init__(self.message)

    def __str__(self):
        return f"{self.message}"


class S3DeleteError(BaseS3Exception):
    def __init__(self, message="Неизвестная ошибка"):
        self.message = f"Произошла ошибка при попытке удаления файла с S3: {message}"
        super().__init__(self.message)

    def __str__(self):
        return f"{self.message}"


class S3OtherError(BaseS3Exception):
    def __init__(self, message="Неизвестная ошибка"):
        self.message = f"Произошла ошибка при попытке работы с S3: {message}"
        super().__init__(self.message)

    def __str__(self):
        return f"{self.message}"


class EmailError(BaseAppException):
    def __init__(self, message="Произошла внутренняя ошибка при работе с Email"):
        self.message = message
        super().__init__(self.message)

    def __str__(self):
        return f"{self.message}"


class EmailSendError(EmailError):
    def __init__(self, message="Неизвестная ошибка"):
        self.message = f"Произошла ошибка при попытке работы с Email: {message}"
        super().__init__(self.message)

    def __str__(self):
        return f"{self.message}"
