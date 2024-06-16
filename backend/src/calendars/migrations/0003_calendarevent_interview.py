import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('calendars', '0002_alter_schedule_unique_together_calendarevent_and_more'),
        ('vacancies', '0009_vacancy_benefits_used_as_template_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='calendarevent',
            name='interview',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='events', to='vacancies.interview', verbose_name='Собеседование'),
        ),
    ]
