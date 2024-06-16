import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0002_alter_industry_name_alter_institution_name_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='specialization',
            name='group',
            field=models.ForeignKey(default='', on_delete=django.db.models.deletion.CASCADE, related_name='specializations', to='base.specializationgroup', verbose_name='Группа'),
            preserve_default=False,
        ),
    ]
