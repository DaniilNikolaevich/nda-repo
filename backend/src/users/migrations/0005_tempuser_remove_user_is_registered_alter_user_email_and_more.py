import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_alter_user_username'),
    ]

    operations = [
        migrations.CreateModel(
            name='TempUser',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создано')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('id', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False, verbose_name='ID')),
                ('username', models.SlugField(max_length=255, verbose_name='Username')),
                ('email', models.EmailField(blank=True, max_length=254, null=True, verbose_name='Email')),
                ('name', models.CharField(max_length=255, verbose_name='Имя')),
                ('surname', models.CharField(max_length=255, verbose_name='Фамилия')),
                ('patronymic', models.CharField(blank=True, max_length=255, null=True, verbose_name='Отчество')),
                ('role', models.IntegerField(choices=[(1, 'Соискатель'), (2, 'Рекрутер'), (3, 'Администратор')], default=1, verbose_name='Роль')),
                ('password_hash', models.TextField(verbose_name='Hash пароля')),
                ('is_registered', models.BooleanField(default=False, verbose_name='Зарегистрирован?')),
            ],
            options={
                'verbose_name': 'Временный пользователь',
                'verbose_name_plural': 'Временные пользователи',
                'ordering': ['-created_at'],
            },
        ),
        migrations.RemoveField(
            model_name='user',
            name='is_registered',
        ),
        migrations.AlterField(
            model_name='user',
            name='email',
            field=models.EmailField(blank=True, max_length=254, null=True, unique=True, verbose_name='Email'),
        ),
        migrations.AlterField(
            model_name='verificationcode',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='users.user', verbose_name='Пользователь'),
        ),
        migrations.AddField(
            model_name='verificationcode',
            name='temp_user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='users.tempuser', verbose_name='Временный пользователь'),
        ),
    ]
