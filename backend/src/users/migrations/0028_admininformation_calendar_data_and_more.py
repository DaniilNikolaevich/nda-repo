from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0027_admininformation_external_calendar_url'),
    ]

    operations = [
        migrations.AddField(
            model_name='admininformation',
            name='calendar_data',
            field=models.JSONField(blank=True, null=True, verbose_name='Данные календаря'),
        ),
        migrations.AddField(
            model_name='admininformation',
            name='external_calendar_hash',
            field=models.CharField(blank=True, max_length=32, null=True, verbose_name='Хэш календаря'),
        ),
        migrations.AddField(
            model_name='admininformation',
            name='external_calendar_type',
            field=models.IntegerField(choices=[(1, 'Google'), (2, 'Yandex'), (3, 'Apple'), (4, 'Bitrix'), (5, 'Другое')], default=1, verbose_name='Тип календаря'),
        ),
        migrations.AddField(
            model_name='admininformation',
            name='max_slots',
            field=models.IntegerField(blank=True, null=True, verbose_name='Максимальное количество слотов'),
        ),
    ]
