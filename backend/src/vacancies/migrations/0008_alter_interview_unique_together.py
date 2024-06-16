from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('vacancies', '0007_remove_recruiterflow_status'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='interview',
            unique_together={('recruiter_flow', 'interview_type')},
        ),
    ]
