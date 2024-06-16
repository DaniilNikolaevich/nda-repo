from base.serializers import BaseModelSerializer
from chat.models import Chat, ChatMessage
from users.admin_settings.serializers import AdminUserSerializer
from users.serializer import UserSerializer, CandidateSerializer


class ChatSerializer(BaseModelSerializer):
    candidate = CandidateSerializer()
    recruiter = AdminUserSerializer(read_only=True)

    class Meta:
        model = Chat
        fields = ['id', 'candidate', 'recruiter', 'name', 'created_at', 'updated_at']


class ChatMessageReadSerializer(BaseModelSerializer):
    chat = ChatSerializer()
    author = UserSerializer()

    class Meta:
        model = ChatMessage
        fields = ['id', 'chat', 'author', 'message', 'created_at', 'updated_at']
