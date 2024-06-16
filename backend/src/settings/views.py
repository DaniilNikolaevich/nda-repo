from django.utils.decorators import method_decorator
from rest_framework import status
from rest_framework.views import APIView

from base.utils.decorators import log_action, tryexcept
from base.utils.external_tools import get_meeting_link
from base.utils.http import Response
from base.utils.notification import send_telegram_notification
from users.decorators import auth
from users.models import User


class BotAccessView(APIView):
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            chat_id = data.get('message', {}).get('chat', {}).get('id')
            user_id = data.get('message', {}).get('text', '').split(' ')[-1]
            if chat_id and user_id:
                try:
                    user = User.objects.get(id=user_id)
                    user_info = user.info
                    user_info.telegram_chat_id = chat_id
                    user_info.save()
                    send_telegram_notification.apply_async(kwargs={"user_id": str(user.id), "message": f"""
    Приветствуем вас в нашем боте! 
    Здесь вы будете получать актуальные подборки вакансий, соответствующих вашей специализации, а также информацию о важных обновлениях и действиях на платформе. Это ваш надежный помощник в мире технологий и новых возможностей.
    Приглашаем вас также присоединиться к нашей официальной группе в Telegram <a href="https://t.me/">Group!</a>. Узнавайте больше о нас, о нашей работе и не пропустите ни одной важной новости. 
    Ждем вас в <a href="https://t.me/">Group!</a>"""})
                except (User.DoesNotExist, ValueError):
                    pass
            else:
                pass
        except Exception as e:
            pass

        return Response(status=status.HTTP_200_OK)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class MeetingLinkView(APIView):
    def dispatch(self, request, *args, **kwargs):
        self.user = kwargs.get('user')
        if self.user.role not in [User.Role.RECRUITER, User.Role.ADMIN]:
            return Response(status=status.HTTP_403_FORBIDDEN, content='Доступ запрещен')
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        link = get_meeting_link()
        return Response({'link': link})
