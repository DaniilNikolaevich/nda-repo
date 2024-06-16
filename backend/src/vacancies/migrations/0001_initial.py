import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('base', '0011_department'),
        ('users', '0025_alter_userinformation_preferred_employment_type'),
    ]

    operations = [
        migrations.CreateModel(
            name='Vacancy',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создано')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('status', models.IntegerField(choices=[(0, 'Новая'), (1, 'Активная'), (2, 'Неактивная'), (3, 'Закрытая'), (4, 'Завершенная'), (5, 'Архивная')], verbose_name='Статус')),
                ('salary', models.IntegerField(verbose_name='Зарплата')),
                ('category', models.IntegerField(blank=True, choices=[(0, 'Тестирование'), (1, 'Разработка'), (2, 'Аналитика'), (3, 'Менеджмент и развитие бизнеса'), (4, 'Data-практика'), (5, 'Архитектура'), (6, 'Дизайн'), (7, 'Маркетинг'), (8, 'HR'), (9, 'Финансы'), (10, 'Продажи'), (11, 'Техническая поддержка'), (12, 'Другое')], null=True, verbose_name='Категория')),
                ('work_schedule', models.IntegerField(choices=[(0, 'Полный день'), (1, 'Сменный график'), (2, 'Гибкий график'), (3, 'Удаленная работа'), (4, 'Гибридная работа'), (5, 'Неполный рабочий день')], verbose_name='График работы')),
                ('employment_type', models.IntegerField(choices=[(0, 'Полная занятость'), (1, 'Частичная занятость'), (2, 'Подработка'), (3, 'Проектная работа'), (4, 'Стажировка'), (5, 'Временная работа')], verbose_name='Тип занятости')),
                ('description', models.TextField(blank=True, null=True, verbose_name='Описание')),
                ('tasks', models.TextField(blank=True, null=True, verbose_name='Обязанности')),
                ('tasks_used_as_template', models.BooleanField(default=False, verbose_name='Используется как шаблон?')),
                ('additional_requirements', models.TextField(blank=True, null=True, verbose_name='Дополнительные требования')),
                ('city', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='vacancies', to='base.city', verbose_name='Город')),
                ('country', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='vacancies', to='base.country', verbose_name='Страна')),
                ('department', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='vacancies', to='base.department', verbose_name='Отдел')),
                ('position', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='vacancies', to='base.position', verbose_name='Должность')),
                ('responsible_recruiter', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='vacancies', to='users.user', verbose_name='Ответственный рекрутер')),
                ('skills', models.ManyToManyField(blank=True, related_name='vacancies', to='base.skill', verbose_name='Ключевые навыки')),
            ],
            options={
                'verbose_name': 'Вакансия',
                'verbose_name_plural': 'Вакансии',
                'ordering': ['-created_at'],
            },
        ),
    ]
