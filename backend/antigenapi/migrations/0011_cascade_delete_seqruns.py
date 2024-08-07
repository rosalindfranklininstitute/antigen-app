# Generated by Django 4.2.6 on 2024-07-18 22:06

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("antigenapi", "0010_named_nanobodies"),
    ]

    operations = [
        migrations.AlterField(
            model_name="sequencingrunresults",
            name="sequencing_run",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                to="antigenapi.sequencingrun",
            ),
        ),
    ]
