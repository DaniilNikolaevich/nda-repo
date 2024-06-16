import logging
from dataclasses import dataclass

from django.core.files.uploadedfile import InMemoryUploadedFile, TemporaryUploadedFile
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from base.serializers import BaseModelSerializer
from news_feed.models import News, NewsComment, NewsDocument, NewsLike, NewsTag
from settings.settings import S3_BUCKET_NEWS, S3_SERVER
from users.serializer import UserSerializer

logger = logging.getLogger(__name__)


class ReadNewsDocumentSerializer(BaseModelSerializer):
    url = serializers.SerializerMethodField()

    def get_url(self, instance):
        return f"{S3_SERVER}/{S3_BUCKET_NEWS}/{instance.path}"

    class Meta:
        model = NewsDocument
        fields = ['id', 'name', 'mime_type', 'url']


class WriteNewsDocumentSerializer(BaseModelSerializer):
    class Meta:
        model = NewsDocument
        fields = ['id', 'name', 'mime_type']


class ReadNewsCommentSerializer(BaseModelSerializer):
    user = UserSerializer(included_fields=['id', 'fullname', 'surname', 'name', 'patronymic', 'avatar_thumbnail_url'])
    class Meta:
        model = NewsComment
        fields = ['id', 'news', 'user', 'content']


class WriteNewsCommentSerializer(BaseModelSerializer):
    class Meta:
        model = NewsComment
        fields = ['id', 'content']


class ReadNewsLikeSerializer(BaseModelSerializer):
    class Meta:
        model = NewsLike
        fields = ['id', 'news', 'user', 'type']


class ReadNewsTagSerializer(BaseModelSerializer):
    class Meta:
        model = NewsTag
        fields = ['id', 'name']


class ReadNewsSerializer(BaseModelSerializer):
    documents = ReadNewsDocumentSerializer(many=True)
    comments = ReadNewsCommentSerializer(many=True)
    likes = ReadNewsLikeSerializer(many=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    relevant_news = serializers.SerializerMethodField()
    cover = serializers.SerializerMethodField()
    tags = ReadNewsTagSerializer(many=True)
    creator = UserSerializer(included_fields=['id', 'fullname', 'surname', 'name', 'patronymic'])
    is_liked = serializers.SerializerMethodField()

    def get_is_liked(self, instance):
        user = self.context.get('user')
        if not user:
            return False
        return instance.likes.filter(user=user).exists()

    def get_cover(self, instance):
        if instance.is_external:
            if not instance.external_cover:
                return None
            return {
                "id": f"{instance.external_cover}",
                "name": "external_cover.png",
                "mime_type": "image/png",
                "url": instance.external_cover
            },
        else:
            temp = instance.documents.filter(is_cover=True).first()
            return ReadNewsDocumentSerializer(temp).data

    def get_relevant_news(self, instance):
        return ReadNewsSerializer(instance.get_relevant_news().prefetch_related('documents', 'comments', 'likes'),
                                  many=True,
                                  included_fields=['id', 'title', 'brief_content',
                                                   'cover', 'likes_count', "comments_count"],
                                  context = {'user': self.context.get('user')}
                                  ).data

    def get_likes_count(self, instance):
        return {
            'likes': instance.likes.filter(type='like').count(),
            'dislikes': instance.likes.filter(type='dislike').count()
        }

    def get_comments_count(self, instance):
        return instance.comments.count()

    class Meta:
        model = News
        fields = ['id', 'title', "brief_content", 'content', 'documents', 'creator', 'is_active', 'comments',
                  'likes',
                  'cover', "comments_count", "likes_count", "relevant_news", "tags", "is_external", "external_link", "is_liked",
                  "created_at"]


class WriteNewsSerializer(BaseModelSerializer):
    tags = serializers.PrimaryKeyRelatedField(many=True, queryset=NewsTag.objects.all())

    def save(self, *args, **kwargs):
        tags = self.validated_data.pop('tags', [])
        documents = self.validated_data.pop('documents', [])
        super().save()
        self.instance.tags.set(tags)
        self.instance.documents.set(documents)
        return self.instance

    class Meta:
        model = News
        fields = ['id', 'title', 'content', 'brief_content', 'tags', 'documents']


class WriteNewsLikeSerializer(BaseModelSerializer):
    class Meta:
        model = NewsLike
        fields = ['id', 'type']


class WriteNewsTagSerializer(BaseModelSerializer):
    class Meta:
        model = NewsTag
        fields = ['name']


@dataclass
class File:
    file: str
    mime: str
    file_name: str
    file_size: int


class UploadFileSerializer(serializers.Serializer):
    file = serializers.FileField()

    def validate(self, data):
        file = data["file"] or data["image"]
        logger.debug(file)
        data["mime"] = file.content_type
        data["file_name"] = file.name
        file_size = file.size
        if file_size > 100 * 1024 * 1024:
            raise ValidationError("Файл слишком большой. Загрузите файл меньше 100 Мб")
        data["file_size"] = file_size
        allowed_mime_types = self.context.get("allowed_mime_types")
        if allowed_mime_types and data["mime"] not in allowed_mime_types:
            raise ValidationError("Недопустимый формат файла")
        if isinstance(file, InMemoryUploadedFile):
            data["file"] = file.file
        elif isinstance(file, TemporaryUploadedFile):
            data["file"] = file.read()
        else:
            raise ValidationError("Файл слишком большой")
        return data

    def create(self, validated_data):
        return File(**validated_data)
