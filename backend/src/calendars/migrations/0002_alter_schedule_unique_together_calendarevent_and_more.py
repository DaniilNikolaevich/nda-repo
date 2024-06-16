import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('calendars', '0001_initial'),
        ('users', '0028_admininformation_calendar_data_and_more'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='schedule',
            unique_together=set(),
        ),
        migrations.CreateModel(
            name='CalendarEvent',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создано')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('uid', models.CharField(blank=True, max_length=1024, null=True, verbose_name='UID события')),
                ('name', models.CharField(blank=True, max_length=1024, null=True, verbose_name='Название события')),
                ('description', models.TextField(blank=True, null=True, verbose_name='Описание события')),
                ('meeting_url', models.URLField(blank=True, null=True, verbose_name='Ссылка на встречу')),
                ('start_date', models.DateField(verbose_name='Дата начала')),
                ('end_date', models.DateField(verbose_name='Дата окончания')),
                ('candidate', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='events_candidate', to='users.user', verbose_name='Кандидат')),
                ('recruiter', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='events_recruiter', to='users.user', verbose_name='Рекрутер')),
            ],
            options={
                'verbose_name': 'Событие',
                'verbose_name_plural': 'События',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='EventSlot',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создано')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('start_time', models.TimeField(verbose_name='Время начала')),
                ('end_time', models.TimeField(verbose_name='Время окончания')),
                ('event', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='booking_slots', to='calendars.calendarevent', verbose_name='Событие')),
            ],
            options={
                'verbose_name': 'Забронированный слот',
                'verbose_name_plural': 'Забронированные слоты',
                'ordering': ['-created_at'],
            },
        ),
    ]
