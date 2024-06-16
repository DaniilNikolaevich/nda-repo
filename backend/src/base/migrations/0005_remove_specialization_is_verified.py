from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0004_alter_specialization_name'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='specialization',
            name='is_verified',
        ),
    ]
