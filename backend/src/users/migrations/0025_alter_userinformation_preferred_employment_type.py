import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0024_userinformation_total_experience'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userinformation',
            name='preferred_employment_type',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(choices=[(0, 'Полная занятость'), (1, 'Частичная занятость'), (2, 'Подработка'), (3, 'Проектная работа'), (4, 'Стажировка'), (5, 'Временная работа')]), blank=True, default=list, size=None, verbose_name='Предпочитаемый тип занятости'),
        ),
    ]
