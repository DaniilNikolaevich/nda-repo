from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0007_employeecompany'),
    ]

    operations = [
        migrations.AlterField(
            model_name='employeecompany',
            name='name',
            field=models.CharField(max_length=500, verbose_name='Название'),
        ),
        migrations.AlterUniqueTogether(
            name='employeecompany',
            unique_together={('name', 'inn')},
        ),
    ]
