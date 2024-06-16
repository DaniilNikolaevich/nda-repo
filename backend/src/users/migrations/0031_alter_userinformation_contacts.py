from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0030_usercomment'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userinformation',
            name='contacts',
            field=models.JSONField(default=list, verbose_name='Контакты'),
        ),
    ]
