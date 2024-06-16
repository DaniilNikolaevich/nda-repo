from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0014_alter_usereducation_unique_together'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='usereducation',
            unique_together=set(),
        ),
        migrations.AlterUniqueTogether(
            name='userworkexperience',
            unique_together=set(),
        ),
    ]
