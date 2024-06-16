from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('news_feed', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='newstag',
            name='name',
            field=models.CharField(max_length=255, unique=True, verbose_name='Название'),
        ),
    ]
