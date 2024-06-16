import datetime
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0012_alter_userworkexperience_unique_together'),
    ]

    operations = [
        migrations.AlterField(
            model_name='usereducation',
            name='start_date',
            field=models.DateField(default=datetime.datetime(2024, 6, 2, 20, 39, 46, 521320, tzinfo=datetime.timezone.utc), verbose_name='Дата начала'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='usereducation',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='education', to='users.user', verbose_name='Пользователь'),
        ),
    ]
