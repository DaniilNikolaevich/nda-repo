from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('news_feed', '0003_newsdocument_path_alter_news_documents'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='news',
            name='company',
        ),
        migrations.AddField(
            model_name='news',
            name='external_id',
            field=models.CharField(blank=True, max_length=255, null=True, unique=True, verbose_name='Внешний ID'),
        ),
        migrations.AddField(
            model_name='news',
            name='external_link',
            field=models.TextField(blank=True, null=True, verbose_name='Ссылка на внешний ресурс'),
        ),
        migrations.AddField(
            model_name='news',
            name='is_external',
            field=models.BooleanField(default=False, verbose_name='Новость внешняя?'),
        ),
    ]
