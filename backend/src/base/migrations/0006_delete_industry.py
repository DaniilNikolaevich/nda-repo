from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0005_remove_specialization_is_verified'),
        ('users', '0007_remove_userinformation_industry'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Industry',
        ),
    ]
