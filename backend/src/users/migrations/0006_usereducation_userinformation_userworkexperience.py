import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0001_initial'),
        ('users', '0005_tempuser_remove_user_is_registered_alter_user_email_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserEducation',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создано')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('start_date', models.DateField(blank=True, null=True, verbose_name='Дата начала')),
                ('end_date', models.DateField(blank=True, null=True, verbose_name='Дата окончания')),
                ('faculty', models.CharField(blank=True, max_length=500, null=True, verbose_name='Факультет')),
                ('speciality', models.CharField(blank=True, max_length=500, null=True, verbose_name='Специальность')),
                ('education_level', models.IntegerField(blank=True, choices=[(1, 'Среднее'), (2, 'Среднее специальное'), (3, 'Неоконченное высшее'), (4, 'Высшее'), (5, 'Бакалавр'), (6, 'Магистр'), (7, 'Кандидат наук'), (8, 'Доктор наук')], null=True, verbose_name='Уровень образования')),
                ('institution', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='users_education', to='base.institution', verbose_name='Университет')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.user', verbose_name='Пользователь')),
            ],
            options={
                'verbose_name': 'Образование пользователя',
                'verbose_name_plural': 'Образование пользователей',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='UserInformation',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создано')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('sex', models.IntegerField(choices=[(0, 'Не указан'), (1, 'Мужской'), (2, 'Женский')], default=0, verbose_name='Пол')),
                ('birth_date', models.DateField(blank=True, null=True, verbose_name='Дата рождения')),
                ('phone', models.CharField(blank=True, max_length=20, null=True, verbose_name='Телефон')),
                ('email', models.EmailField(blank=True, max_length=254, null=True, verbose_name='Email')),
                ('site', models.URLField(blank=True, null=True, verbose_name='Сайт')),
                ('telegram', models.CharField(blank=True, max_length=255, null=True, verbose_name='Telegram')),
                ('about', models.TextField(blank=True, null=True, verbose_name='О себе')),
                ('city', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='users_info', to='base.city', verbose_name='Город')),
                ('industry', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='users_info', to='base.industry', verbose_name='Отрасль')),
                ('skills', models.ManyToManyField(blank=True, related_name='users_info', to='base.skill', verbose_name='Ключевые навыки')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='users.user', verbose_name='Пользователь')),
            ],
            options={
                'verbose_name': 'Информация пользователя',
                'verbose_name_plural': 'Информация пользователей',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='UserWorkExperience',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создано')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('company', models.CharField(max_length=255, verbose_name='Компания')),
                ('start_date', models.DateField(verbose_name='Дата начала')),
                ('end_date', models.DateField(blank=True, null=True, verbose_name='Дата окончания')),
                ('duties', models.TextField(blank=True, null=True, verbose_name='Обязанности')),
                ('achievements', models.TextField(blank=True, null=True, verbose_name='Достижения')),
                ('position', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='users_work_experience', to='base.position', verbose_name='Должность')),
                ('specialization', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='users_work_experience', to='base.specialization', verbose_name='Специализация')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.user', verbose_name='Пользователь')),
            ],
            options={
                'verbose_name': 'Опыт работы пользователя',
                'verbose_name_plural': 'Опыт работы пользователей',
                'ordering': ['-created_at'],
            },
        ),
    ]
