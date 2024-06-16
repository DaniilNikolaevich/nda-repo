import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_remove_user_phone_user_is_registered_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='VerificationCode',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создано')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('id', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False, verbose_name='ID')),
                ('verification_type', models.IntegerField(choices=[(1, 'Подтверждение Email'), (2, 'Сброс пароля')], default=1, verbose_name='Тип подтверждения')),
                ('email', models.EmailField(blank=True, max_length=254, null=True, verbose_name='Email пользователя')),
                ('code', models.UUIDField(default=uuid.uuid4, unique=True, verbose_name='Уникальный код')),
                ('valid_until', models.DateTimeField(verbose_name='Код активен до')),
                ('is_used', models.BooleanField(default=False, verbose_name='Использован?')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.user', verbose_name='Пользователь')),
            ],
            options={
                'verbose_name': 'Код подтверждения',
                'verbose_name_plural': 'Коды подтверждения',
                'ordering': ['-created_at'],
            },
        ),
    ]
