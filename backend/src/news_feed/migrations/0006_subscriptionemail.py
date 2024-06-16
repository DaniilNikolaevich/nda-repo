import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('news_feed', '0005_news_external_cover'),
    ]

    operations = [
        migrations.CreateModel(
            name='SubscriptionEmail',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создано')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('id', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False, verbose_name='ID Подписки')),
                ('email', models.EmailField(max_length=254, verbose_name='Email')),
                ('is_active', models.BooleanField(default=True, verbose_name='Активно?')),
            ],
            options={
                'verbose_name': 'Email подписка',
                'verbose_name_plural': 'Email подписки',
            },
        ),
    ]
