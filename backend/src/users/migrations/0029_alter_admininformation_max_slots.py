from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0028_admininformation_calendar_data_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='admininformation',
            name='max_slots',
            field=models.IntegerField(blank=True, default=1, null=True, verbose_name='Максимальное количество слотов'),
        ),
    ]
