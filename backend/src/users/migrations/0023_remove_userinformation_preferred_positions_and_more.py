import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0010_alter_employeecompany_unique_together_and_more'),
        ('users', '0022_alter_usereducation_institution'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userinformation',
            name='preferred_positions',
        ),
        migrations.AddField(
            model_name='userinformation',
            name='preferred_position',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='users_info', to='base.position', verbose_name='Желаемая должность'),
        ),
    ]
