from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0026_merge_20240612_0208'),
    ]

    operations = [
        migrations.AddField(
            model_name='admininformation',
            name='external_calendar_url',
            field=models.URLField(blank=True, null=True, verbose_name='Ссылка на внешний календарь'),
        ),
    ]
