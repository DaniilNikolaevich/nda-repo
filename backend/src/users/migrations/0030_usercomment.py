import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0029_alter_admininformation_max_slots'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserComment',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создано')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('text', models.TextField(verbose_name='Текст комментария')),
                ('file_url', models.URLField(blank=True, null=True, verbose_name='URL файла')),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='authored_comments', to='users.user', verbose_name='Автор')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comments', to='users.user', verbose_name='Пользователь')),
            ],
            options={
                'verbose_name': 'Комментарий о пользователе',
                'verbose_name_plural': 'Комментарии о пользователях',
                'ordering': ['-created_at'],
            },
        ),
    ]
