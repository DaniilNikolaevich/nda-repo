from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0008_alter_employeecompany_name_and_more'),
        ('users', '0011_alter_userworkexperience_company_and_more'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='userworkexperience',
            unique_together={('user', 'company', 'position', 'start_date', 'end_date')},
        ),
    ]
