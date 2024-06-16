import uuid

from django.db import models

from base.models import BaseModel


# Create your models here.

class NewsTag(BaseModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, verbose_name="ID Тега")
    name = models.CharField(max_length=255, verbose_name="Название", unique=True)

    class Meta:
        verbose_name = "Тег"
        verbose_name_plural = "Теги"

    def __str__(self):
        return f"{self.name}"


class News(BaseModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, verbose_name="ID Новости")
    title = models.CharField(max_length=255, verbose_name="Заголовок")
    brief_content = models.TextField(verbose_name="Краткое содержание")
    content = models.TextField(verbose_name="Содержание")
    tags = models.ManyToManyField('NewsTag', blank=True, verbose_name="Теги")
    documents = models.ManyToManyField('NewsDocument', blank=True, verbose_name="Документы", related_name="news")
    creator = models.ForeignKey('users.User', null=True, blank=True, verbose_name="Создатель", on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True, verbose_name="Активно?")
    is_external = models.BooleanField(default=False, verbose_name="Новость внешняя?")
    external_id = models.CharField(max_length=255, null=True, blank=True, unique=True, verbose_name="Внешний ID")
    external_link = models.TextField(null=True, blank=True, verbose_name="Ссылка на внешний ресурс")
    external_cover = models.TextField(null=True, blank=True, verbose_name="Обложка внешней новости")

    class Meta:
        verbose_name = "Новость"
        verbose_name_plural = "Новости"

    def __str__(self):
        return f"{self.title}. {self.creator}"

    def get_relevant_news(self):
        return News.objects.filter(tags__in=self.tags.all()).exclude(id=self.id).distinct()


class NewsDocument(BaseModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, verbose_name="ID Документа")
    name = models.CharField(max_length=255, verbose_name="Название")
    mime_type = models.CharField(max_length=255, verbose_name="MIME-тип")
    is_cover = models.BooleanField(default=False, verbose_name="Обложка")
    path = models.CharField(max_length=500, null=True, blank=True, verbose_name="Путь")

    class Meta:
        verbose_name = "Документ"
        verbose_name_plural = "Документы"

    def __str__(self):
        return f"{self.id} {self.name}"


class NewsComment(BaseModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, verbose_name="ID Комментария")
    news = models.ForeignKey('News', verbose_name="Новость", on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey('users.User', verbose_name="Пользователь", on_delete=models.CASCADE)
    content = models.TextField(verbose_name="Содержание")

    class Meta:
        verbose_name = "Комментарий"
        verbose_name_plural = "Комментарии"

    def __str__(self):
        return f"{self.id} {self.news} {self.user}"


class NewsLike(BaseModel):
    class LikeType(models.TextChoices):
        LIKE = 'like', 'Лайк'
        DISLIKE = 'dislike', 'Дизлайк'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, verbose_name="ID Лайка")
    news = models.ForeignKey('News', verbose_name="Новость", on_delete=models.CASCADE, related_name="likes")
    user = models.ForeignKey('users.User', verbose_name="Пользователь", on_delete=models.CASCADE)
    type = models.CharField(max_length=10, choices=LikeType.choices, verbose_name="Тип")

    class Meta:
        verbose_name = "Лайк"
        verbose_name_plural = "Лайки"

    def __str__(self):
        return f"{self.id} {self.news} {self.user}"


class SubscriptionEmail(BaseModel):
    class SubscriptionType(models.IntegerChoices):
        NEWS = 0, 'Новости'
        VACANCIES = 1, 'Вакансии'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, verbose_name="ID Подписки")
    email = models.EmailField(verbose_name="Email")
    is_active = models.BooleanField(default=True, verbose_name="Активно?")
    subscription_type = models.IntegerField(
        choices=SubscriptionType.choices,
        verbose_name="Тип подписки",
        default=SubscriptionType.NEWS
    )

    class Meta:
        verbose_name = "Email подписка"
        verbose_name_plural = "Email подписки"

    def __str__(self):
        return f"{self.email}"
