import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0025_alter_userinformation_preferred_employment_type'),
        ('vacancies', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='RecruitmentFlow',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создано')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('step', models.IntegerField(choices=[(0, 'Отклик соискателя'), (1, 'Кандидат отобран'), (2, 'Общее собеседование'), (3, 'Ожидание согласования'), (4, 'Техническое собеседование'), (5, 'Дополнительное собеседование'), (6, 'Предложение о работе'), (7, 'Отказ'), (8, 'Удалено')], verbose_name='Шаг')),
                ('status', models.IntegerField(blank=True, choices=[(0, 'Ожидание приглашения на собеседование рекрутером'), (1, 'Ожидание подтверждения и выбора времени соискателем'), (2, 'Собеседование назначено'), (3, 'Собеседование завершено'), (4, 'Собеседование отменено рекрутером'), (5, 'Собеседование отменено соискателем')], default=None, null=True, verbose_name='Статус шага')),
                ('candidate', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='recruitment_flows', to='users.user', verbose_name='Кандидат')),
                ('vacancy', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='recruitment_flows', to='vacancies.vacancy', verbose_name='Вакансия')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='RecruitmentFlowHistory',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создано')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('message', models.TextField(verbose_name='Сообщение')),
                ('recruitment_flow', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='history', to='vacancies.recruitmentflow', verbose_name='Рекрутинговый процесс')),
            ],
            options={
                'verbose_name': 'История рекрутингового процесса',
                'verbose_name_plural': 'Истории рекрутинговых процессов',
                'ordering': ['-created_at'],
            },
        ),
    ]
