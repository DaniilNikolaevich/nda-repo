from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0020_userinformation_country_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='userinformation',
            name='recruiter_note',
            field=models.TextField(blank=True, null=True, verbose_name='Заметка рекрутера'),
        ),
    ]
