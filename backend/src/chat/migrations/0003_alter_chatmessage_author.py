import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0002_defaultmessages'),
        ('users', '0029_alter_admininformation_max_slots'),
    ]

    operations = [
        migrations.AlterField(
            model_name='chatmessage',
            name='author',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='chat_message_author', to='users.user'),
        ),
    ]
