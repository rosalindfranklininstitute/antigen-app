# Generated by Django 5.0.7 on 2024-07-29 16:48

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("antigenapi", "0011_cascade_delete_seqruns"),
    ]

    operations = [
        migrations.RenameField(
            model_name="nanobody",
            old_name="cdr3",
            new_name="sequence",
        ),
    ]
