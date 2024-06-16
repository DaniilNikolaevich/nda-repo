from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0023_remove_userinformation_preferred_positions_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='userinformation',
            name='total_experience',
            field=models.IntegerField(blank=True, null=True, verbose_name='Общий стаж работы'),
        ),
    ]
