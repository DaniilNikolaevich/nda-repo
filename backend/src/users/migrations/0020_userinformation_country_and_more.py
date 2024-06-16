import django.contrib.postgres.fields
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0009_rename_region_country_alter_country_options_and_more'),
        ('users', '0019_userinformation_cv_filename'),
    ]

    operations = [
        migrations.AddField(
            model_name='userinformation',
            name='country',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='users_info', to='base.country', verbose_name='Страна'),
        ),
        migrations.AlterField(
            model_name='userinformation',
            name='preferred_work_schedule',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(choices=[(0, 'Полный день'), (1, 'Сменный график'), (2, 'Гибкий график'), (3, 'Удаленная работа'), (4, 'Гибридная работа'), (5, 'Неполный рабочий день')]), blank=True, default=list, size=None, verbose_name='Предпочитаемый график работы'),
        ),
        migrations.AlterField(
            model_name='verificationcode',
            name='verification_type',
            field=models.IntegerField(choices=[(1, 'Первичное задание пароля'), (2, 'Сброс пароля')], default=1, verbose_name='Тип подтверждения'),
        ),
    ]
