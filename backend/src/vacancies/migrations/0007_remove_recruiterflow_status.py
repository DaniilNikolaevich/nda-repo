from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('vacancies', '0006_recruiterflow_chat_interview_delete_candidateflow'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='recruiterflow',
            name='status',
        ),
    ]
