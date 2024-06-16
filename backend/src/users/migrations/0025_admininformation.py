import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0024_userinformation_total_experience'),
    ]

    operations = [
        migrations.CreateModel(
            name='AdminInformation',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создано')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('position', models.CharField(blank=True, max_length=255, null=True, verbose_name='Должность')),
                ('department', models.CharField(blank=True, max_length=255, null=True, verbose_name='Отдел')),
                ('phone', models.CharField(blank=True, max_length=255, null=True, verbose_name='Телефон')),
                ('email', models.EmailField(blank=True, max_length=254, null=True, verbose_name='Email')),
                ('avatar', models.UUIDField(blank=True, null=True, verbose_name='ID Аватара')),
                ('avatar_thumbnail', models.UUIDField(blank=True, null=True, verbose_name='ID миниатюры аватара')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='admin_info', to='users.user', verbose_name='Пользователь')),
            ],
            options={
                'verbose_name': 'Информация рекрутера',
                'verbose_name_plural': 'Информация рекрутеров',
                'ordering': ['-created_at'],
            },
        ),
    ]
