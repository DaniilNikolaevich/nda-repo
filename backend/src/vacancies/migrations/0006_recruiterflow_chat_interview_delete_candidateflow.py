import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0003_alter_chatmessage_author'),
        ('vacancies', '0005_vacancy_benefits'),
    ]

    operations = [
        migrations.AddField(
            model_name='recruiterflow',
            name='chat',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='chat.chat', verbose_name='Чат c соискателем'),
        ),
        migrations.CreateModel(
            name='Interview',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создано')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('interview_type', models.IntegerField(choices=[(0, 'Общее'), (1, 'Техническое'), (2, 'Дополнительное')], verbose_name='Тип собеседования')),
                ('status', models.IntegerField(choices=[(0, 'Ожидание назначения'), (1, 'Собеседование назначено'), (2, 'Собеседование завершено'), (3, 'Собеседование отменено рекрутером'), (4, 'Собеседование отменено соискателем')], default=0, verbose_name='Статус')),
                ('date', models.DateTimeField(blank=True, null=True, verbose_name='Дата и время')),
                ('start_time', models.TimeField(blank=True, null=True, verbose_name='Время начала')),
                ('end_time', models.TimeField(blank=True, null=True, verbose_name='Время окончания')),
                ('meeting_link', models.URLField(blank=True, null=True, verbose_name='Ссылка на встречу')),
                ('comment', models.TextField(blank=True, null=True, verbose_name='Комментарий')),
                ('recruiter_flow', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='interviews', to='vacancies.recruiterflow', verbose_name='Флоу процесса рекрутинга')),
            ],
            options={
                'verbose_name': 'Собеседование',
                'verbose_name_plural': 'Собеседования',
                'ordering': ['-created_at'],
            },
        ),
        migrations.DeleteModel(
            name='CandidateFlow',
        ),
    ]
