# Generated by Django 4.0.5 on 2022-06-14 19:53

import datetime
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion
import django.db.models.manager
import django.utils.timezone
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Antigen',
            fields=[
                ('number', models.PositiveSmallIntegerField(editable=False)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('creation_time', models.DateTimeField(default=django.utils.timezone.now, editable=False)),
            ],
            options={
                'abstract': False,
            },
            managers=[
                ('raw_objects', django.db.models.manager.Manager()),
            ],
        ),
        migrations.CreateModel(
            name='ElisaPlate',
            fields=[
                ('number', models.PositiveSmallIntegerField(editable=False)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('threshold', models.FloatField(null=True)),
                ('creation_time', models.DateTimeField(default=django.utils.timezone.now, editable=False)),
            ],
            options={
                'abstract': False,
            },
            managers=[
                ('raw_objects', django.db.models.manager.Manager()),
            ],
        ),
        migrations.CreateModel(
            name='Nanobody',
            fields=[
                ('number', models.PositiveSmallIntegerField(editable=False)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('creation_time', models.DateTimeField(default=django.utils.timezone.now, editable=False)),
            ],
            options={
                'abstract': False,
            },
            managers=[
                ('raw_objects', django.db.models.manager.Manager()),
            ],
        ),
        migrations.CreateModel(
            name='Project',
            fields=[
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=256, unique=True)),
                ('short_title', models.CharField(max_length=64, unique=True)),
                ('description', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='LocalAntigen',
            fields=[
                ('antigen_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='antigenapi.antigen')),
                ('sequence', models.TextField(validators=[django.core.validators.RegexValidator('^[ARNDCHIQEGLKMFPSTWYVBZ]*$')])),
                ('molecular_mass', models.IntegerField()),
            ],
            bases=('antigenapi.antigen', models.Model),
            managers=[
                ('raw_objects', django.db.models.manager.Manager()),
            ],
        ),
        migrations.CreateModel(
            name='UniProtAntigen',
            fields=[
                ('antigen_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='antigenapi.antigen')),
                ('uniprot_accession_number', models.CharField(max_length=32, unique=True)),
                ('sequence', models.TextField(editable=False, validators=[django.core.validators.RegexValidator('^[ARNDCHIQEGLKMFPSTWYVBZ]*$')])),
                ('molecular_mass', models.IntegerField(editable=False)),
                ('name', models.CharField(editable=False, max_length=32)),
            ],
            bases=('antigenapi.antigen', models.Model),
            managers=[
                ('raw_objects', django.db.models.manager.Manager()),
            ],
        ),
        migrations.CreateModel(
            name='Sequence',
            fields=[
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('cdr1', models.TextField(validators=[django.core.validators.RegexValidator('^[ARNDCHIQEGLKMFPSTWYVBZ]*$')])),
                ('cdr2', models.TextField(validators=[django.core.validators.RegexValidator('^[ARNDCHIQEGLKMFPSTWYVBZ]*$')])),
                ('cdr3', models.TextField(validators=[django.core.validators.RegexValidator('^[ARNDCHIQEGLKMFPSTWYVBZ]*$')])),
                ('creation_time', models.DateTimeField(default=datetime.datetime.now, editable=False)),
                ('nanobody', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='antigenapi.nanobody')),
            ],
        ),
        migrations.AddField(
            model_name='nanobody',
            name='project',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='antigenapi.project'),
        ),
        migrations.CreateModel(
            name='ElisaWell',
            fields=[
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('location', models.PositiveSmallIntegerField(choices=[(1, 'A1'), (2, 'A2'), (3, 'A3'), (4, 'A4'), (5, 'A5'), (6, 'A6'), (7, 'A7'), (8, 'A8'), (9, 'A9'), (10, 'A10'), (11, 'A11'), (12, 'A12'), (13, 'B1'), (14, 'B2'), (15, 'B3'), (16, 'B4'), (17, 'B5'), (18, 'B6'), (19, 'B7'), (20, 'B8'), (21, 'B9'), (22, 'B10'), (23, 'B11'), (24, 'B12'), (25, 'C1'), (26, 'C2'), (27, 'C3'), (28, 'C4'), (29, 'C5'), (30, 'C6'), (31, 'C7'), (32, 'C8'), (33, 'C9'), (34, 'C10'), (35, 'C11'), (36, 'C12'), (37, 'D1'), (38, 'D2'), (39, 'D3'), (40, 'D4'), (41, 'D5'), (42, 'D6'), (43, 'D7'), (44, 'D8'), (45, 'D9'), (46, 'D10'), (47, 'D11'), (48, 'D12'), (49, 'E1'), (50, 'E2'), (51, 'E3'), (52, 'E4'), (53, 'E5'), (54, 'E6'), (55, 'E7'), (56, 'E8'), (57, 'E9'), (58, 'E10'), (59, 'E11'), (60, 'E12'), (61, 'F1'), (62, 'F2'), (63, 'F3'), (64, 'F4'), (65, 'F5'), (66, 'F6'), (67, 'F7'), (68, 'F8'), (69, 'F9'), (70, 'F10'), (71, 'F11'), (72, 'F12'), (73, 'G1'), (74, 'G2'), (75, 'G3'), (76, 'G4'), (77, 'G5'), (78, 'G6'), (79, 'G7'), (80, 'G8'), (81, 'G9'), (82, 'G10'), (83, 'G11'), (84, 'G12'), (85, 'H1'), (86, 'H2'), (87, 'H3'), (88, 'H4'), (89, 'H5'), (90, 'H6'), (91, 'H7'), (92, 'H8'), (93, 'H9'), (94, 'H10'), (95, 'H11'), (96, 'H12')])),
                ('optical_density', models.FloatField(null=True)),
                ('antigen', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='antigenapi.antigen')),
                ('nanobody', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='antigenapi.nanobody')),
                ('plate', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='antigenapi.elisaplate')),
            ],
        ),
        migrations.AddField(
            model_name='elisaplate',
            name='project',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='antigenapi.project'),
        ),
        migrations.AddField(
            model_name='antigen',
            name='project',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='antigenapi.project'),
        ),
        migrations.AlterUniqueTogether(
            name='nanobody',
            unique_together={('project', 'number')},
        ),
        migrations.AddConstraint(
            model_name='elisawell',
            constraint=models.UniqueConstraint(fields=('plate', 'location'), name='unique_well'),
        ),
        migrations.AlterUniqueTogether(
            name='elisaplate',
            unique_together={('project', 'number')},
        ),
        migrations.AlterUniqueTogether(
            name='antigen',
            unique_together={('project', 'number')},
        ),
    ]
