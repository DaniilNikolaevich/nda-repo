from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0008_alter_employeecompany_name_and_more'),
        ('users', '0013_alter_usereducation_start_date_and_more'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='usereducation',
            unique_together={('user', 'institution', 'start_date', 'end_date')},
        ),
    ]
