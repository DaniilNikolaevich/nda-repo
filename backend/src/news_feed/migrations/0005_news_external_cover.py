from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('news_feed', '0004_remove_news_company_news_external_id_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='news',
            name='external_cover',
            field=models.TextField(blank=True, null=True, verbose_name='Обложка внешней новости'),
        ),
    ]
