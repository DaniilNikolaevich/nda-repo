from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='phone',
        ),
        migrations.AddField(
            model_name='user',
            name='is_registered',
            field=models.BooleanField(default=False, verbose_name='Зарегистрирован?'),
        ),
        migrations.AddField(
            model_name='user',
            name='password_hash',
            field=models.TextField(default='', verbose_name='Hash пароля'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='user',
            name='is_active',
            field=models.BooleanField(default=False, verbose_name='Активен?'),
        ),
    ]
