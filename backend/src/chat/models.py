from django.db import models

from base.models import BaseModel
from chat.tasks import send_message_to_centrifugo


class Chat(BaseModel):
    candidate = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='chat_candidate')
    recruiter = models.ForeignKey('users.User', on_delete=models.CASCADE, null=True, blank=True,
                                  related_name='chat_recruiter')
    name = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        db_table = 'chat'
        verbose_name = 'Чат'
        verbose_name_plural = 'Чаты'

    def __str__(self):
        return f"{self.id}{self.name} - {self.candidate}"


class ChatMessage(BaseModel):
    chat = models.ForeignKey('chat.Chat', on_delete=models.CASCADE, related_name='chat_message')
    author = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='chat_message_author', null=True,
                               blank=True)
    message = models.TextField()
    is_read_by_recruiter = models.BooleanField(default=False, verbose_name='Прочитано рекрутером?')
    is_read_by_candidate = models.BooleanField(default=False, verbose_name='Прочитано соискателем?')

    class Meta:
        db_table = 'chat_message'
        verbose_name = 'Сообщение'
        verbose_name_plural = 'Сообщения'

    def __str__(self):
        return f"[{self.chat}]{self.author} - {self.message}"

    def save(self, *args, **kwargs):
        is_creating = self._state.adding
        if is_creating:
            send_message_to_centrifugo.apply_async(kwargs={
                "channel": str(self.chat.id),
                "author_id": str(self.author.id) if self.author else None,
                "message": self.message
            })

            if self.author is None:
                self.is_read_by_recruiter = True
            else:
                if self.author.id == self.chat.recruiter.id:
                    self.is_read_by_recruiter = True
                elif self.author.id == self.chat.candidate.id:
                    self.is_read_by_candidate = True

        return super().save(*args, **kwargs)


class DefaultMessages(BaseModel):
    message = models.TextField()
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='default_messages')

    class Meta:
        db_table = 'default_messages'
        verbose_name = 'Стандартное сообщение рекрутера'
        verbose_name_plural = 'Стандартные сообщения рекрутера'

    def __str__(self):
        return self.message
