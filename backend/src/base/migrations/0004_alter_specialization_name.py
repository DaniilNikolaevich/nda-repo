from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0003_alter_specialization_group'),
    ]

    operations = [
        migrations.AlterField(
            model_name='specialization',
            name='name',
            field=models.CharField(max_length=255, verbose_name='Название'),
        ),
    ]
