import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0010_alter_employeecompany_unique_together_and_more'),
        ('users', '0021_userinformation_recruiter_note'),
    ]

    operations = [
        migrations.AlterField(
            model_name='usereducation',
            name='institution',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='users_education', to='base.institution', verbose_name='Образовательная организация'),
        ),
    ]
