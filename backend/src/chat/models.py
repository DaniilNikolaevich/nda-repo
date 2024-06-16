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

    class Meta:
        db_table = 'chat_message'
        verbose_name = 'Сообщение'
        verbose_name_plural = 'Сообщения'

    def __str__(self):
        return f"[{self.chat}]{self.author} - {self.message}"

    def save(self, *args, **kwargs):
        send_message_to_centrifugo.apply_async(kwargs={
            "channel": str(self.chat.id),
            "author_id": str(self.author.id) if self.author else None,
            "message": self.message
        })
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
