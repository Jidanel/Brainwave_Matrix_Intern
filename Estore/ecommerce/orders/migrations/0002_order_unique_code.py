# Generated by Django 5.1.3 on 2024-11-19 18:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='unique_code',
            field=models.CharField(default='C83328C58', max_length=9, unique=True),
        ),
    ]
