import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '0027_admininformation_external_calendar_url'),
    ]

    operations = [
        migrations.CreateModel(
            name='ExternalBooking',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создано')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('uid', models.CharField(blank=True, max_length=1024, null=True, verbose_name='UID события')),
                ('name', models.CharField(blank=True, max_length=1024, null=True, verbose_name='Название события')),
                ('start_datetime', models.DateTimeField(verbose_name='Дата и время начала')),
                ('end_datetime', models.DateTimeField(verbose_name='Дата и время окончания')),
                ('recruiter', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='external_bookings', to='users.user', verbose_name='Рекрутер')),
            ],
            options={
                'verbose_name': 'Внешнее бронирования',
                'verbose_name_plural': 'Внешние бронирования',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Schedule',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создано')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('weekday', models.IntegerField(choices=[(0, 'Понедельник'), (1, 'Вторник'), (2, 'Среда'), (3, 'Четверг'), (4, 'Пятница'), (5, 'Суббота'), (6, 'Воскресенье')], verbose_name='День недели')),
                ('is_day_off', models.BooleanField(default=False, verbose_name='Выходной?')),
                ('recruiter', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='schedules', to='users.user', verbose_name='Рекрутер')),
            ],
            options={
                'verbose_name': 'Расписание работы рекрутера',
                'verbose_name_plural': 'Расписание работы рекрутеров',
                'ordering': ['-created_at'],
                'unique_together': {('recruiter', 'weekday')},
            },
        ),
        migrations.CreateModel(
            name='SpecialDay',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создано')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('date', models.DateField(verbose_name='Дата')),
                ('is_day_off', models.BooleanField(default=False, verbose_name='Выходной?')),
                ('recruiter', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='special_days', to='users.user', verbose_name='Рекрутер')),
            ],
            options={
                'verbose_name': 'Специальный день',
                'verbose_name_plural': 'Специальные дни',
                'ordering': ['-created_at'],
                'unique_together': {('recruiter', 'date')},
            },
        ),
        migrations.CreateModel(
            name='ScheduleSlot',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создано')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('start_time', models.TimeField(verbose_name='Время начала')),
                ('end_time', models.TimeField(verbose_name='Время окончания')),
                ('schedule', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='schedule_slots', to='calendars.schedule', verbose_name='Расписание')),
            ],
            options={
                'verbose_name': 'Временной слот',
                'verbose_name_plural': 'Временные слоты',
                'ordering': ['-created_at'],
                'unique_together': {('schedule', 'start_time', 'end_time')},
            },
        ),
        migrations.CreateModel(
            name='SpecialDaySlot',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создано')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('start_time', models.TimeField(verbose_name='Время начала')),
                ('end_time', models.TimeField(verbose_name='Время окончания')),
                ('special_day', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='special_day_slots', to='calendars.specialday', verbose_name='Специальный день')),
            ],
            options={
                'verbose_name': 'Временной слот специального дня',
                'verbose_name_plural': 'Временные слоты специальных дней',
                'ordering': ['-created_at'],
                'unique_together': {('special_day', 'start_time', 'end_time')},
            },
        ),
    ]
