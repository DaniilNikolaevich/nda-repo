from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vacancies', '0004_rename_candidaterecruitmentflow_candidateflow_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='vacancy',
            name='benefits',
            field=models.TextField(blank=True, null=True, verbose_name='Бонусы'),
        ),
    ]
