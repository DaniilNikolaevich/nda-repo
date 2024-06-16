from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('news_feed', '0002_alter_newstag_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='newsdocument',
            name='path',
            field=models.CharField(blank=True, max_length=500, null=True, verbose_name='Путь'),
        ),
        migrations.AlterField(
            model_name='news',
            name='documents',
            field=models.ManyToManyField(blank=True, related_name='news', to='news_feed.newsdocument', verbose_name='Документы'),
        ),
    ]
