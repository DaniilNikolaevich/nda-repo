from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0006_usereducation_userinformation_userworkexperience'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userinformation',
            name='industry',
        ),
    ]
