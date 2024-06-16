from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_verificationcode'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='username',
            field=models.SlugField(max_length=255, unique=True, verbose_name='Username'),
        ),
    ]
