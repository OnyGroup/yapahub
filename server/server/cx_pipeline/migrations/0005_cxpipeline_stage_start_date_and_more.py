# Generated by Django 5.1.5 on 2025-03-08 08:40

import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cx_pipeline', '0004_pipelineactivity_pipelinestage_cxpipeline_stage'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='cxpipeline',
            name='stage_start_date',
            field=models.DateTimeField(default=django.utils.timezone.now, help_text='Date when the current stage was entered'),
        ),
        migrations.AddField(
            model_name='pipelinestage',
            name='expected_duration_days',
            field=models.PositiveIntegerField(default=7, help_text='Expected number of days to complete this stage'),
        ),
        migrations.CreateModel(
            name='StageTransition',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('entry_date', models.DateTimeField(default=django.utils.timezone.now)),
                ('exit_date', models.DateTimeField(blank=True, null=True)),
                ('from_stage', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='transitions_from', to='cx_pipeline.pipelinestage')),
                ('pipeline', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='transitions', to='cx_pipeline.cxpipeline')),
                ('to_stage', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='transitions_to', to='cx_pipeline.pipelinestage')),
                ('user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='stage_transitions', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-entry_date'],
            },
        ),
    ]
