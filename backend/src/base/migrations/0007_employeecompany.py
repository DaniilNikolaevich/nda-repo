import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0006_delete_industry'),
    ]

    operations = [
        migrations.CreateModel(
            name='EmployeeCompany',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создано')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('is_verified', models.BooleanField(default=False, verbose_name='Подтверждено')),
                ('name', models.CharField(max_length=500, unique=True, verbose_name='Название')),
                ('inn', models.CharField(blank=True, max_length=12, null=True, verbose_name='ИНН')),
            ],
            options={
                'verbose_name': 'Компания',
                'verbose_name_plural': 'Компании',
                'ordering': ['name'],
            },
        ),
    ]
