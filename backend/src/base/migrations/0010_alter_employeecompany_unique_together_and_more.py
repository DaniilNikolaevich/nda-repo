from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0009_rename_region_country_alter_country_options_and_more'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='employeecompany',
            unique_together=set(),
        ),
        migrations.RemoveField(
            model_name='employeecompany',
            name='inn',
        ),
    ]
