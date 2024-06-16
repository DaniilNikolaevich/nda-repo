import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0007_employeecompany'),
        ('users', '0010_alter_userworkexperience_user'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userworkexperience',
            name='company',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='users_work_experience', to='base.employeecompany', verbose_name='Компания'),
        ),
        migrations.AlterField(
            model_name='userworkexperience',
            name='position',
            field=models.ForeignKey(default='', on_delete=django.db.models.deletion.CASCADE, related_name='users_work_experience', to='base.position', verbose_name='Должность'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='userworkexperience',
            name='specialization',
            field=models.ForeignKey(default='', on_delete=django.db.models.deletion.CASCADE, related_name='users_work_experience', to='base.specialization', verbose_name='Специализация'),
            preserve_default=False,
        ),
    ]
