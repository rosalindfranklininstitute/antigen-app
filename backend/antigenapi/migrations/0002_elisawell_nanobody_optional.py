# Generated by Django 4.1 on 2022-08-09 15:32

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('antigenapi', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='elisawell',
            name='nanobody',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='antigenapi.nanobody'),
        ),
    ]