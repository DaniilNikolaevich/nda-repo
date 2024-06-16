# Generated by Django 5.0.6 on 2024-06-16 12:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('news_feed', '0006_subscriptionemail'),
    ]

    operations = [
        migrations.AddField(
            model_name='subscriptionemail',
            name='subscription_type',
            field=models.IntegerField(choices=[(0, 'Новости'), (1, 'Вакансии')], default=0, verbose_name='Тип подписки'),
        ),
    ]