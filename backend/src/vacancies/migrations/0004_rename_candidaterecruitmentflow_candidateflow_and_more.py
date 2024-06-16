from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0026_merge_20240612_0208'),
        ('vacancies', '0003_candidaterecruitmentflow_recruiterrecruitmentflow_and_more'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='CandidateRecruitmentFlow',
            new_name='CandidateFlow',
        ),
        migrations.RenameModel(
            old_name='RecruitmentFlowHistory',
            new_name='FlowHistory',
        ),
        migrations.RenameModel(
            old_name='RecruiterRecruitmentFlow',
            new_name='RecruiterFlow',
        ),
    ]
