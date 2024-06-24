import jwt
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from django.utils.decorators import method_decorator
from rest_framework import status
from rest_framework.views import APIView

from base.utils.decorators import log_action, tryexcept
from base.utils.exceptions import BadRequestException
from base.utils.http import Response
from base.utils.paginators import QuerySetProcessor
from chat.filters import ChatMessageFilter
from chat.models import Chat, ChatMessage
from chat.serializers import ChatMessageReadSerializer, ChatSerializer
from chat.tasks import set_read_status_new_message
from settings.settings import CENTRIFUGO_HMAC_SECRET_KEY
from users.decorators import auth
from users.models import User


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class StartChatView(APIView):
    current_user = None

    def dispatch(self, request, *args, **kwargs):
        self.current_user = kwargs.get('user')
        if not self.current_user.is_staff:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')

        return super().dispatch(request, *args, **kwargs)

    def get(self, request, candidate_id, *args, **kwargs):
        if not candidate_id:
            return Response(status=status.HTTP_400_BAD_REQUEST, content='Не указан кандидат')
        try:
            chats = Chat.objects.filter(candidate_id=candidate_id)
        except ObjectDoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND, content='Чат не найден')

        chats = ChatSerializer(chats, many=True).data

        token = jwt.encode({"sub": str(self.current_user.id)}, CENTRIFUGO_HMAC_SECRET_KEY)
        return Response({'chats': chats, 'token': token})

    def post(self, request, *args, **kwargs):
        candidate_id = request.data.get('candidate_id')
        chat_name = request.data.get('name')
        if not candidate_id:
            return Response(status=status.HTTP_400_BAD_REQUEST, content='Не указан кандидат')

        try:
            candidate = User.objects.get(id=candidate_id)
        except ObjectDoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND, content='Кандидат не найден')

        if chat_name is None or chat_name == "":
            chat_name = f"Чат с кандидатом {candidate.fullname}"

        chat = Chat.objects.create(
            candidate=candidate,
            name=chat_name,
            recruiter=self.current_user
        )
        return Response({'chat_id': chat.id})


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class ChatView(APIView):

    def dispatch(self, request, *args, **kwargs):
        self.user = kwargs.get('user')
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, chat_id, *args, **kwargs):
        try:
            chat = Chat.objects.get(id=chat_id)
        except ObjectDoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND, content='Чат не найден')

        queryset_processor = QuerySetProcessor(
            model=ChatMessage,
            model_serializer=ChatMessageReadSerializer,
            queryset=chat.chat_message.all().order_by('created_at'),
            filter_instance=ChatMessageFilter,
            context={"kwargs": kwargs},
            request=request
        )
        try:
            result = queryset_processor.get_result(search_list=['message__icontains'])
        except BadRequestException as error:
            return Response(
                status=status.HTTP_400_BAD_REQUEST,
                content=error.message
            )
        user = kwargs.get('user')
        if user == chat.recruiter:
            queryset_processor.queryset.update(is_read_by_recruiter=True)
        elif user == chat.candidate:
            queryset_processor.queryset.update(is_read_by_candidate=True)
        else:
            pass
        return Response(result)

    def post(self, request, chat_id, *args, **kwargs):
        message = request.data.get('message')
        if not message:
            return Response(status=status.HTTP_400_BAD_REQUEST, content='Не указано сообщение')
        try:
            chat = Chat.objects.get(id=chat_id)
        except ObjectDoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND, content='Чат не найден')

        chat_message = ChatMessage.objects.create(
            chat=chat,
            author=self.user,
            message=message
        )
        set_read_status_new_message.apply_async(kwargs={
            "message_id": str(chat_message.id)
        })

        return Response(status=status.HTTP_201_CREATED, content={"id": str(chat_message.id)})


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class ChatListView(APIView):

    def dispatch(self, request, *args, **kwargs):
        self.user = kwargs.get('user')
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        chats = Chat.objects.filter(Q(candidate=self.user) | Q(recruiter=self.user)).distinct()

        chats = ChatSerializer(chats, many=True).data
        token = jwt.encode({"sub": str(self.user.id)}, CENTRIFUGO_HMAC_SECRET_KEY)
        return Response({'chats': chats, 'token': token})


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class DefaultMessagesView(APIView):

    def dispatch(self, request, *args, **kwargs):
        self.user = kwargs.get('user')
        if self.user.role not in [User.Role.RECRUITER, User.Role.ADMIN]:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        default_messages = self.user.default_messages.all()
        return Response([{'id': message.id, 'message': message.message} for message in default_messages])

    def post(self, request, *args, **kwargs):
        message = request.data.get('message')
        if not message:
            return Response(status=status.HTTP_400_BAD_REQUEST, content='Не указано сообщение')
        default_message = self.user.default_messages.create(message=message)
        return Response(status=status.HTTP_201_CREATED, content={"id": str(default_message.id)})


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class NotificationStat(APIView):
    def dispatch(self, request, *args, **kwargs):
        self.user = kwargs.get('user')
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        if self.user.role == User.Role.RECRUITER:
            read_field = 'is_read_by_recruiter'
            self.chats = Chat.objects.filter(recruiter=self.user)
        elif self.user.role == User.Role.CANDIDATE:
            read_field = 'is_read_by_candidate'
            self.chats = Chat.objects.filter(candidate=self.user)
        else:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')
        result = {"total": 0}
        for chat in self.chats:
            messages = chat.chat_message.all()
            result[str(chat.id)] = messages.filter(**{read_field: False}).count()
            result["total"] += result[str(chat.id)]
        return Response(result)

