from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0018_remove_userinformation_email_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='userinformation',
            name='cv_filename',
            field=models.CharField(blank=True, max_length=1024, null=True, verbose_name='Имя файла резюме'),
        ),
    ]
