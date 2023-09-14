# Generated by Django 4.1.7 on 2023-09-14 10:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("antigenapi", "0005_antigen_short_name"),
    ]

    operations = [
        migrations.AlterField(
            model_name="antigen",
            name="short_name",
            field=models.CharField(
                default=None, max_length=32, unique=True, null=False
            ),
            preserve_default=False,
        ),
    ]
