from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vacancies', '0008_alter_interview_unique_together'),
    ]

    operations = [
        migrations.AddField(
            model_name='vacancy',
            name='benefits_used_as_template',
            field=models.BooleanField(default=False, verbose_name='Преимущества используются как шаблон?'),
        ),
        migrations.AlterField(
            model_name='interview',
            name='status',
            field=models.IntegerField(choices=[(0, 'Ожидание приглашения на интервью'), (1, 'Ожидание выбора времени соискателем'), (2, 'Собеседование назначено'), (3, 'Собеседование завершено'), (4, 'Собеседование отменено рекрутером'), (5, 'Собеседование отменено соискателем')], default=0, verbose_name='Статус'),
        ),
        migrations.AlterField(
            model_name='vacancy',
            name='tasks_used_as_template',
            field=models.BooleanField(default=False, verbose_name='Задачи используются как шаблон?'),
        ),
    ]
