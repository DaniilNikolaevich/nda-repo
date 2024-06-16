import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0009_alter_userinformation_user'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userworkexperience',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='work_experience', to='users.user', verbose_name='Пользователь'),
        ),
    ]
