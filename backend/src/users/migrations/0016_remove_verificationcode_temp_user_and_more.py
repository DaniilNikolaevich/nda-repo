from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0015_alter_usereducation_unique_together_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='verificationcode',
            name='temp_user',
        ),
        migrations.RemoveField(
            model_name='user',
            name='username',
        ),
        migrations.AddField(
            model_name='user',
            name='is_registered',
            field=models.BooleanField(default=False, verbose_name='Зарегистрирован?'),
        ),
        migrations.AlterField(
            model_name='user',
            name='email',
            field=models.EmailField(default='', max_length=254, verbose_name='Email'),
            preserve_default=False,
        ),
        migrations.DeleteModel(
            name='TempUser',
        ),
    ]
