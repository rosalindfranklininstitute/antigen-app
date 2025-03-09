# Generated by Django 5.1.4 on 2025-03-09 00:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("antigenapi", "0013_pan_round_concentration"),
    ]

    operations = [
        migrations.RenameField(
            model_name="antigen",
            old_name="short_name",
            new_name="long_name",
        ),
        migrations.RenameField(
            model_name="antigen",
            old_name="preferred_name",
            new_name="short_name",
        ),
        migrations.AlterField(
            model_name="antigen",
            name="short_name",
            field=models.CharField(max_length=32, unique=True),
        ),
        migrations.AlterField(
            model_name="antigen",
            name="long_name",
            field=models.CharField(blank=True, max_length=256),
        ),
    ]
