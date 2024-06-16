import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0003_alter_chatmessage_author'),
        ('users', '0030_usercomment'),
    ]

    operations = [
        migrations.AddField(
            model_name='chat',
            name='recruiter',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='chat_recruiter', to='users.user'),
        ),
    ]
