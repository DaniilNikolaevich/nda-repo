from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0007_remove_userinformation_industry'),
    ]

    operations = [
        migrations.AddField(
            model_name='userinformation',
            name='avatar',
            field=models.UUIDField(blank=True, null=True, verbose_name='ID Аватара'),
        ),
        migrations.AddField(
            model_name='userinformation',
            name='avatar_thumbnail',
            field=models.UUIDField(blank=True, null=True, verbose_name='ID миниатюры аватара'),
        ),
    ]
