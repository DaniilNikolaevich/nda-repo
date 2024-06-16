from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0008_alter_employeecompany_name_and_more'),
        ('users', '0019_userinformation_cv_filename'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Region',
            new_name='Country',
        ),
        migrations.AlterModelOptions(
            name='country',
            options={'ordering': ['name'], 'verbose_name': 'Страна', 'verbose_name_plural': 'Страны'},
        ),
        migrations.RemoveField(
            model_name='city',
            name='region',
        ),
    ]
