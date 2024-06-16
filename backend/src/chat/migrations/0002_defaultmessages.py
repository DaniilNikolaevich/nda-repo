import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0001_initial'),
        ('users', '0026_merge_20240612_0208'),
    ]

    operations = [
        migrations.CreateModel(
            name='DefaultMessages',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создано')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('message', models.TextField()),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='default_messages', to='users.user')),
            ],
            options={
                'verbose_name': 'Стандартное сообщение рекрутера',
                'verbose_name_plural': 'Стандартные сообщения рекрутера',
                'db_table': 'default_messages',
            },
        ),
    ]
