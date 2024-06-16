import django.contrib.postgres.fields
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0008_alter_employeecompany_name_and_more'),
        ('users', '0017_user_unique_registered_email'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userinformation',
            name='email',
        ),
        migrations.RemoveField(
            model_name='userinformation',
            name='phone',
        ),
        migrations.RemoveField(
            model_name='userinformation',
            name='site',
        ),
        migrations.RemoveField(
            model_name='userinformation',
            name='telegram',
        ),
        migrations.RemoveField(
            model_name='userworkexperience',
            name='specialization',
        ),
        migrations.AddField(
            model_name='userinformation',
            name='ai_summary',
            field=models.TextField(blank=True, null=True, verbose_name='AI Summary'),
        ),
        migrations.AddField(
            model_name='userinformation',
            name='business_trip',
            field=models.BooleanField(blank=True, null=True, verbose_name='Готов к командировкам?'),
        ),
        migrations.AddField(
            model_name='userinformation',
            name='contacts',
            field=models.JSONField(default=dict, verbose_name='Контакты'),
        ),
        migrations.AddField(
            model_name='userinformation',
            name='cv',
            field=models.UUIDField(blank=True, null=True, verbose_name='ID Резюме'),
        ),
        migrations.AddField(
            model_name='userinformation',
            name='personalized_questions',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.TextField(), blank=True, default=list, size=None, verbose_name='Персонализированные вопросы'),
        ),
        migrations.AddField(
            model_name='userinformation',
            name='preferred_employment_type',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(choices=[(0, 'Полная занятость'), (1, 'Частичная занятость'), (2, 'Подработка'), (3, 'Проектная работа'), (4, 'Стажировка'), (5, 'Временная работа')]), blank=True, default=list, size=None),
        ),
        migrations.AddField(
            model_name='userinformation',
            name='preferred_positions',
            field=models.ManyToManyField(blank=True, related_name='users_info', to='base.position', verbose_name='Желаемые должности'),
        ),
        migrations.AddField(
            model_name='userinformation',
            name='preferred_salary',
            field=models.IntegerField(blank=True, null=True, verbose_name='Желаемая зарплата'),
        ),
        migrations.AddField(
            model_name='userinformation',
            name='preferred_work_schedule',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(choices=[(0, 'Полный день'), (1, 'Сменный график'), (2, 'Гибкий график'), (3, 'Удаленная работа'), (4, 'Гибридная работа'), (5, 'Неполный рабочий день')]), blank=True, default=list, size=None),
        ),
        migrations.AddField(
            model_name='userinformation',
            name='relocation',
            field=models.BooleanField(blank=True, null=True, verbose_name='Готов к переезду?'),
        ),
        migrations.AddField(
            model_name='userinformation',
            name='telegram_chat_id',
            field=models.CharField(blank=True, max_length=255, null=True, verbose_name='ID чата в Telegram'),
        ),
        migrations.AlterField(
            model_name='user',
            name='name',
            field=models.CharField(blank=True, max_length=255, null=True, verbose_name='Имя'),
        ),
        migrations.AlterField(
            model_name='user',
            name='password_hash',
            field=models.TextField(blank=True, null=True, verbose_name='Hash пароля'),
        ),
        migrations.AlterField(
            model_name='user',
            name='surname',
            field=models.CharField(blank=True, max_length=255, null=True, verbose_name='Фамилия'),
        ),
        migrations.AlterField(
            model_name='usereducation',
            name='education_level',
            field=models.IntegerField(blank=True, choices=[(1, 'Среднее'), (2, 'Среднее специальное'), (3, 'Неоконченное высшее'), (4, 'Высшее'), (5, 'Бакалавр'), (6, 'Магистр'), (7, 'Кандидат наук'), (8, 'Доктор наук'), (9, 'Курсы')], null=True, verbose_name='Уровень образования'),
        ),
        migrations.AlterField(
            model_name='usereducation',
            name='institution',
            field=models.CharField(blank=True, max_length=1024, null=True, verbose_name='Университет'),
        ),
        migrations.AlterField(
            model_name='usereducation',
            name='start_date',
            field=models.DateField(blank=True, null=True, verbose_name='Дата начала'),
        ),
        migrations.AlterField(
            model_name='userworkexperience',
            name='company',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='users_work_experience', to='base.employeecompany', verbose_name='Компания'),
        ),
        migrations.AlterField(
            model_name='userworkexperience',
            name='position',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='users_work_experience', to='base.position', verbose_name='Должность'),
        ),
        migrations.AlterField(
            model_name='userworkexperience',
            name='start_date',
            field=models.DateField(blank=True, null=True, verbose_name='Дата начала'),
        ),
    ]
