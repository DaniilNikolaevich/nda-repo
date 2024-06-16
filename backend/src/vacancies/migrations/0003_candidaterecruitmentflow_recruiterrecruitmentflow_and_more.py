import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0025_alter_userinformation_preferred_employment_type'),
        ('vacancies', '0002_recruitmentflow_recruitmentflowhistory'),
    ]

    operations = [
        migrations.CreateModel(
            name='CandidateRecruitmentFlow',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создано')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('step', models.IntegerField(choices=[(0, 'Отклик соискателя'), (1, 'Общее собеседование'), (2, 'Ожидание согласования'), (3, 'Техническое собеседование'), (4, 'Дополнительное собеседование'), (5, 'Предложение о работе'), (6, 'Отказ')], verbose_name='Шаг')),
                ('status', models.IntegerField(blank=True, choices=[(0, 'Ожидание подтверждения и выбора времени соискателем'), (1, 'Собеседование назначено'), (2, 'Собеседование завершено'), (3, 'Собеседование отменено рекрутером'), (4, 'Собеседование отменено соискателем')], default=None, null=True, verbose_name='Статус шага')),
                ('candidate', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='candidate_recruitment_flows', to='users.user', verbose_name='Кандидат')),
                ('vacancy', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='candidate_recruitment_flows', to='vacancies.vacancy', verbose_name='Вакансия')),
            ],
            options={
                'verbose_name': 'Флоу процесса рекрутинга (кандидат)',
                'verbose_name_plural': 'Флоу процессов рекрутинга (кандидат)',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='RecruiterRecruitmentFlow',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создано')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('step', models.IntegerField(choices=[(0, 'Отклик соискателя'), (1, 'Кандидат отобран'), (2, 'Общее собеседование'), (3, 'Ожидание согласования'), (4, 'Техническое собеседование'), (5, 'Дополнительное собеседование'), (6, 'Предложение о работе'), (7, 'Отказ'), (8, 'Удалено')], verbose_name='Шаг')),
                ('status', models.IntegerField(blank=True, choices=[(0, 'Ожидание приглашения на собеседование рекрутером'), (1, 'Ожидание подтверждения и выбора времени соискателем'), (2, 'Собеседование назначено'), (3, 'Собеседование завершено'), (4, 'Собеседование отменено рекрутером'), (5, 'Собеседование отменено соискателем')], default=None, null=True, verbose_name='Статус шага')),
                ('candidate', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='recruiter_recruitment_flows', to='users.user', verbose_name='Кандидат')),
                ('vacancy', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='recruiter_recruitment_flows', to='vacancies.vacancy', verbose_name='Вакансия')),
            ],
            options={
                'verbose_name': 'Флоу процесса рекрутинга (рекрутер)',
                'verbose_name_plural': 'Флоу процессов рекрутинга (рекрутер)',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AlterField(
            model_name='recruitmentflowhistory',
            name='recruitment_flow',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='history', to='vacancies.recruiterrecruitmentflow', verbose_name='Рекрутинговый процесс'),
        ),
        migrations.DeleteModel(
            name='RecruitmentFlow',
        ),
    ]
