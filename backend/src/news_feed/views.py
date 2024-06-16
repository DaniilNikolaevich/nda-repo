import logging
import uuid

from django.db import IntegrityError
from django.db.models import Q
from django.utils.decorators import method_decorator
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.views import APIView

from base.utils.exceptions import BadRequestException, S3ConnectionError, S3DownloadError, S3UploadError
from base.utils.files import S3Wrapper
from base.utils.http import Response
from base.utils.paginators import AbstractPaginator
from news_feed.filters import NewsFilter
from news_feed.models import News, NewsComment, NewsDocument, NewsLike, NewsTag, SubscriptionEmail
from news_feed.serializers import ReadNewsCommentSerializer, ReadNewsSerializer, ReadNewsTagSerializer, \
    UploadFileSerializer, WriteNewsCommentSerializer, WriteNewsSerializer, \
    WriteNewsTagSerializer
from settings.settings import S3_BUCKET_NEWS, S3_SERVER
from users.decorators import auth
from users.models import User

logger = logging.getLogger(__name__)


# Create your views here.

@method_decorator(name='dispatch', decorator=[auth])
class NewsTagView(APIView):

    def dispatch(self, request, *args, **kwargs):
        self.tags = NewsTag.objects.all()
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        serializer = ReadNewsTagSerializer(self.tags, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        self.user = kwargs.get('user')
        if not self.user.is_staff:
            return Response(status=403, content="Вы не являетесь администратором")
        serializer = WriteNewsTagSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            serializer.save()
        except IntegrityError:
            return Response(status=400, content="Тег с таким названием уже существует")
        return Response({"id": serializer.instance.id}, status=201)


@method_decorator(name='dispatch', decorator=[auth])
class NewsTagDetailView(APIView):

    def dispatch(self, request, *args, **kwargs):
        self.tag = NewsTag.objects.get(id=kwargs.get('tag_id'))
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        serializer = ReadNewsTagSerializer(self.tag)
        return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        self.user = kwargs.get('user')
        if not self.user.is_admin:
            return Response(status=403, content="Вы не являетесь администратором")
        serializer = WriteNewsTagSerializer(self.tag, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, *args, **kwargs):
        self.user = kwargs.get('user')
        if not self.user.is_admin:
            return Response(status=403, content="Вы не являетесь администратором")
        self.tag.delete()
        return Response(status=204)


class NewsFeedView(APIView):
    def dispatch(self, request, *args, **kwargs):
        self.news = News.objects.filter(is_active=True).order_by('-created_at').prefetch_related('documents',
                                                                                                 'comments', 'likes')
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        try:
            paginator = AbstractPaginator(
                News,
                ReadNewsSerializer,
                self.news,
                filter_instance=NewsFilter,
                context={"kwargs": self.kwargs, 'user': kwargs.get('user')},
                request=request,
                included_fields=['id', 'title', 'brief_content',
                                 'cover', 'likes_count', "comments_count", "is_external", 'is_liked',
                                 "external_link", "creator", "tags", "created_at"]
            )
            result = paginator.get_result(
                search_list=["title__search", "id__icontains",
                             "brief_content__search", "content__search"],
                filter_kwargs={"user": kwargs.get("user")},
            )
        except BadRequestException as error:
            return Response(status=400, content=error.message)

        return Response(result)

    @method_decorator(decorator=[auth])
    def post(self, request, *args, **kwargs):
        self.user: User = kwargs.get('user')
        if not self.user.is_admin and not self.user.is_recruiter:
            return Response(status=403, content="Вы не являетесь администратором")
        serializer = WriteNewsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(creator=self.user)
        return Response({"id": serializer.instance.id}, status=201)


class NewsDetailView(APIView):
    def dispatch(self, request, *args, **kwargs):
        self.user = kwargs.get('user')
        try:
            self.news_item = News.objects.prefetch_related(
                'documents',
                'comments', 'likes').get(Q(id=kwargs.get('news_id')) & (
                    Q(is_active=True) | (Q(creator=self.user))))
        except News.DoesNotExist:
            return Response(status=404, content="Новость не найдена")
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        serializer = ReadNewsSerializer(self.news_item, context={'user': self.user})
        return Response(serializer.data)

    @method_decorator(name='dispatch', decorator=[auth])
    def put(self, request, *args, **kwargs):
        self.user = kwargs.get('user')
        if not self.user.is_admin and not self.user.is_recruiter:
            return Response(status=403, content="Вы не являетесь создателем новости")
        serializer = WriteNewsSerializer(self.news_item, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=204)

    @method_decorator(name='dispatch', decorator=[auth])
    def delete(self, request, *args, **kwargs):
        self.user = kwargs.get('user')
        if not self.user.is_admin and not self.user.is_recruiter:
            return Response(status=403, content="Вы не являетесь создателем новости")
        self.news_item.is_active = False
        self.news_item.save()
        return Response(status=204)


@method_decorator(name='dispatch', decorator=[auth])
class NewsDocumentView(APIView):
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def dispatch(self, request, *args, **kwargs):
        self.user = kwargs.get('user')
        try:
            self.s3 = S3Wrapper(bucket_name=S3_BUCKET_NEWS)
        except S3ConnectionError as error:
            logger.warning(error)
            return Response(
                status=400,
                content="Ошибка при соединении с сервером S3. Повторите попытку позже")
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        body = request.data
        data = UploadFileSerializer(data=request.FILES)
        data.is_valid(raise_exception=True)
        file = data.save()
        file_name = file.file_name
        file_uuid = uuid.uuid4()
        file_path = f"{file_uuid}_{file_name}"
        instance = NewsDocument.objects.create(
            name=file_name,
            mime_type=file.mime,
            is_cover=True if body.get('is_cover').lower() == 'true' else False,
            path=file_path
        )
        try:
            self.s3.upload_file(file_path, file.file)
        except (S3UploadError, S3DownloadError) as error:
            logger.warning(error)
            return Response(
                status=400,
                content="Не удалось загрузить файл документа. Повторите попытку позже",
            )
        return Response(status=201, content={
            "id": instance.id,
            "url": f"{S3_SERVER}/{S3_BUCKET_NEWS}/{instance.path}"
        })

    def delete(self, request, *args, **kwargs):
        try:
            instance = NewsDocument.objects.get(id=kwargs.get('document_id')).prefetch_related('news').first()
        except NewsDocument.DoesNotExist:
            return Response(status=404, content="Документ не найден")
        if (instance.news.creator != self.user
                and instance.news.company != self.user.get_company()
                and self.user.is_admin):
            return Response(status=403, content="Вы не являетесь создателем новости")
        try:
            self.s3.delete_file(instance.path)
        except S3DownloadError as error:
            logger.warning(error)
            return Response(
                status=400,
                content="Не удалось удалить файл документа. Повторите попытку позже",
            )
        instance.delete()
        return Response(status=204)


class NewsCommentsView(APIView):
    def dispatch(self, request, *args, **kwargs):
        try:
            self.news_item = News.objects.get(id=kwargs.get('news_id'))
            self.comments = self.news_item.comments.all()
        except News.DoesNotExist:
            return Response(status=404, content="Новость не найдена")
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        serializer = ReadNewsCommentSerializer(self.comments, many=True)
        return Response(serializer.data)

    @method_decorator(decorator=[auth])
    def post(self, request, *args, **kwargs):
        self.user = kwargs.get('user')
        serializer = WriteNewsCommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(news=self.news_item, user=self.user)
        return Response({"id": serializer.instance.id}, status=201)


class NewsCommentDetailView(APIView):
    def dispatch(self, request, *args, **kwargs):
        try:
            self.comment = NewsComment.objects.get(id=kwargs.get('comment_id'))
        except NewsComment.DoesNotExist:
            return Response(status=404, content="Комментарий не найден")
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        serializer = ReadNewsCommentSerializer(self.comment)
        return Response(serializer.data)

    @method_decorator(decorator=[auth])
    def delete(self, request, *args, **kwargs):
        self.user = kwargs.get('user')
        if self.comment.user != self.user and not self.user.is_admin:
            return Response(status=403, content="Вы не являетесь автором комментария")
        self.comment.delete()
        return Response(status=204)


@method_decorator(name='dispatch', decorator=[auth])
class NewsLikesView(APIView):
    def dispatch(self, request, *args, **kwargs):
        try:
            self.news_item = News.objects.prefetch_related('likes').get(id=kwargs.get('news_id'))
        except News.DoesNotExist:
            return Response(status=404, content="Новость не найдена")
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        return Response(self.news_item.likes.count())

    @method_decorator(decorator=[auth])
    def post(self, request, *args, **kwargs):
        self.user = kwargs.get('user')
        type = request.data.get('type')
        if type not in ['like', 'dislike']:
            return Response(status=400, content="Неверный тип лайка")
        if self.news_item.likes.filter(user=self.user).exists():
            like = self.news_item.likes.get(user=self.user.id)
            if like.type != type:
                like.type = type
                like.save()
            else:
                like.delete()
            return Response(status=201)
        else:
            like = NewsLike.objects.create(news=self.news_item, user=self.user, type=type)
            self.news_item.likes.add(like)
        return Response({"id": like.id}, status=201)


class NewsSubscriptionView(APIView):
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        SubscriptionEmail.objects.create(
            email=email,
            is_active=True,
            subscription_type=SubscriptionEmail.SubscriptionType.NEWS
        )
        return Response(status=201)
