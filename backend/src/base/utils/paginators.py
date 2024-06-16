import logging
from functools import reduce
from typing import Type

from django.core.paginator import EmptyPage, Paginator
from django.db.models import Model, Q, QuerySet
from rest_framework.serializers import ModelSerializer

from base.models import BaseModel
from base.serializers import BaseModelSerializer
from base.utils.http import clean_get_params

logger = logging.getLogger(__name__)


class AbstractQuerySetProcessor:
    def __init__(
            self,
            model: Type[Model] | Type[BaseModel],
            model_serializer: Type[ModelSerializer] | Type[BaseModelSerializer],
            queryset: QuerySet = None,
            sort_fields: list = None,
            included_fields: list = None,
            excluded_fields: list = None,
            expanded_fields: list | str = '__all__',
            folded_fields: list | str = (),
            context: dict = None,
            filter_instance=None,
            request=None):
        """
        Конструктор

        :param model: Модель, для которой нужно сделать пагинатор
        :param model_serializer: BaseModelSerializer - сериализатор модели
        :param queryset: QuerySet - queryset, который нужно использовать для пагинатора
        :param sort_fields: list - список полей для сортировки
        :param included_fields: list - список полей, которые нужно включить в сериализацию
        :param excluded_fields: list - список полей, которые нужно исключить из сериализации
        :param expanded_fields: list | str - список полей, которые нужно развернуть
        :param folded_fields: list | str - список полей, которые нужно свернуть
        :param context: dict - контекст сериализации
        :param filter_instance: AbstractFilter - фильтр для пагинатора
        """
        self.model = model
        self.model_serializer = model_serializer
        self.queryset = queryset
        self.sort_fields = sort_fields or [field.name for field in model._meta.get_fields()]
        self.included_fields = included_fields
        self.excluded_fields = excluded_fields
        self.expanded_fields = expanded_fields
        self.folded_fields = folded_fields
        self.context = context
        self.filter_instance = filter_instance
        self.request = request
        self.total_pages = 0
        self.total_count = 0
        self.page = None
        self.has_next_page = False

    def search(self, search, search_list: list[str] = None) -> QuerySet:
        """
        Поиск по модели

        :param search: str Поисковая строка
        :param search_list: list[str] Список полей, по которым будет производиться поиск
        :return: QuerySet - queryset с результатами поиска
        """
        if search and search_list:
            search_query = [Q(**{field: search}) for field in search_list]
            self.queryset = self.queryset.filter(reduce(lambda x, y: x | y, search_query))
        return self.queryset

    def sort(self, sort_by: list[str], sort_desc: list[str]) -> QuerySet:
        """
        Сортировка по модели

        :param sort_by: list - список полей, по которым нужно отсортировать
        :param sort_desc: list - список направлений сортировки
        :return: QuerySet - queryset с результатами сортировки
        """

        self.queryset = self.queryset.distinct()
        if sort_by:
            for sort_value, order_value in zip(sort_by, sort_desc):
                try:
                    self.queryset = self.queryset.order_by(f'{order_value}{sort_value}')
                except Exception:
                    continue
        else:
            self.queryset = self.queryset.order_by('-created_at')

        return self.queryset

    def filter(self, **kwargs) -> QuerySet:
        """
        Фильтрация по модели

        :param kwargs: dict - словарь с фильтрами
        :return: QuerySet - queryset с результатами фильтрации
        """
        if self.filter_instance:
            self.queryset = self.filter_instance(self.request.GET, self.queryset, **kwargs).qs
        return self.queryset


class AbstractPaginator(AbstractQuerySetProcessor):

    def paginate(self, page: int, page_size: int) -> tuple:
        """
        Пагинация по модели

        :param page: int - номер страницы
        :param page_size: int - размер страницы
        :return: dict - словарь с результатами пагинации
        """
        paginator = Paginator(self.queryset, page_size)
        self.total_pages = paginator.num_pages
        self.total_count = paginator.count
        try:
            self.page = paginator.page(page)
        except EmptyPage:
            self.page = paginator.page(paginator.num_pages)
        self.has_next_page = self.page.has_next()

        return self.total_pages, self.total_count, self.page, self.has_next_page

    def get_result(
            self,
            search=None,
            page=None,
            items_per_page=None,
            sort_by: list[str] = None,
            sort_desc: list[str] = None,
            search_list: list[str] = None,
            filter_kwargs: dict = None
    ) -> dict:
        """
        Получение результатов пагинации

        :param search: str поисковая строка
        :param search_list: list[str] Список полей, по которым будет производиться поиск.
        :param page: int - номер страницы
        :param items_per_page: int - количество элементов на странице
        :param sort_by: list - список полей, по которым нужно отсортировать
        :param sort_desc: list - список направлений сортировки
        :param filter_kwargs: dict - словарь kwargs для фильтра
        :return: dict - словарь с пагинированными данными

        """
        if self.request:
            search, page, items_per_page, sort_by, sort_desc = clean_get_params(self.request)
        if self.filter_instance:
            self.filter(**filter_kwargs) if filter_kwargs else self.filter()
        self.search(search, search_list)
        self.sort(sort_by, sort_desc)
        if not items_per_page or items_per_page == '-1':
            items_per_page = self.queryset.count()
        self.paginate(page, items_per_page)

        if issubclass(self.model_serializer, BaseModelSerializer):
            # Если сериализатор наследуется от BaseModelSerializer, то используем его методы
            # noinspection PyCallingNonCallable
            serializer = self.model_serializer(self.page, many=True,
                                               included_fields=self.included_fields,
                                               excluded_fields=self.excluded_fields,
                                               expanded_fields=self.expanded_fields,
                                               folded_fields=self.folded_fields,
                                               context=self.context)
        else:
            # Иначе используем стандартный метод сериализации
            serializer = self.model_serializer(self.page, many=True,
                                               context=self.context)

        return {
            "total_pages": self.total_pages,
            "total_count": self.total_count,
            "has_next_page": self.has_next_page,
            "payload": serializer.data
        }

    def get_result_qs(
            self,
            search,
            page,
            items_per_page,
            sort_by: list[str],
            sort_desc: list[str],
            search_list: list[str] = None,
            filter_kwargs: dict = None
    ) -> tuple:
        """
        Получение результатов пагинации

        :param search: str Поисковая строка
        :param search_list: list[str] Список полей, по которым будет производиться поиск
        :param page: int - номер страницы
        :param items_per_page: int - количество элементов на странице
        :param sort_by: list - список полей, по которым нужно отсортировать
        :param sort_desc: list - список направлений сортировки
        :param filter_kwargs: dict - словарь kwargs
        :return: page: QuerySet - queryset с пагинированными данными
        :return: total_pages: int - общее количество страниц
        :return: total_count: int - общее количество элементов
        :return: has_next_page: bool - есть ли следующая страница
        """
        if self.filter_instance:
            self.filter(**filter_kwargs) if filter_kwargs else self.filter()
        self.search(search, search_list)
        self.sort(sort_by, sort_desc)
        if not items_per_page or items_per_page == '-1':
            items_per_page = self.queryset.count()
        self.paginate(page, items_per_page)

        return self.page, self.total_pages, self.total_count, self.has_next_page

    @staticmethod
    def get_empty_response():
        return {
            "total_pages": 1,
            "total_count": 0,
            "has_next_page": False,
            "payload": []
        }


class QuerySetProcessor(AbstractQuerySetProcessor):
    def get_result(self, search=None, sort_by: list[str] = None, sort_desc: list[str] = None,
                   search_list: list[str] = None, filter_kwargs: dict = None) -> dict:
        """
        :param search: str поисковая строка
        :param search_list: list[str] Список полей, по которым будет производиться поиск.
        :param sort_by: list - список полей, по которым нужно отсортировать
        :param sort_desc: list - список направлений сортировки
        :param filter_kwargs: dict - словарь kwargs для фильтра
        :return: dict - словарь с пагинированными данными

        """
        if self.request:
            search, _, _, sort_by, sort_desc = clean_get_params(self.request)
        if self.filter_instance:
            self.filter(**filter_kwargs) if filter_kwargs else self.filter()
        self.search(search, search_list)
        self.sort(sort_by, sort_desc)

        if issubclass(self.model_serializer, BaseModelSerializer):
            # Если сериализатор наследуется от BaseModelSerializer, то используем его методы
            # noinspection PyCallingNonCallable
            serializer = self.model_serializer(
                self.queryset,
                many=True,
                included_fields=self.included_fields,
                excluded_fields=self.excluded_fields,
                expanded_fields=self.expanded_fields,
                folded_fields=self.folded_fields,
                context=self.context
            )
        else:
            # Иначе используем стандартный метод сериализации
            serializer = self.model_serializer(self.queryset, many=True, context=self.context)

        return serializer.data
