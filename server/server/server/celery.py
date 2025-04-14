from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
from decouple import config
from celery.schedules import crontab

# Load environment variables from .env
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')

# Explicitly load the .env file
config.search_path = os.getcwd()  # Ensures decouple looks in the correct directory
SENDGRID_API_KEY = config('SENDGRID_API_KEY', default='NOT_FOUND')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='NOT_FOUND')

print(f"Loaded SendGrid API Key: {SENDGRID_API_KEY}")
print(f"Loaded Default From Email: {DEFAULT_FROM_EMAIL}")

app = Celery('server')

# Configure Celery with optimized settings for SQLite
app.conf.update(
    broker_url='redis://localhost:6379/0',
    result_backend='redis://localhost:6379/0',
    task_serializer='json',
    result_serializer='json',
    accept_content=['json'],
    timezone='UTC',
    
    # Settings to handle SQLite locking better
    task_acks_late=True,  # Don't acknowledge until task is complete
    worker_prefetch_multiplier=1,  # Process one task at a time
    task_reject_on_worker_lost=True,  # Enable retries if worker crashes
    
    # Retry configuration for database operations
    task_default_retry_delay=5,  # Default retry delay (seconds)
    task_max_retries=3,  # Maximum retry attempts
    
    # Periodic cleanup task for SQLite
    beat_schedule={
        'cleanup_sqlite_locks': {
            'task': 'call_center.tasks.cleanup_sqlite_locks',
            'schedule': crontab(hour=4, minute=30),  # Daily at 4:30 AM
        },
    }
)

app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Optional: Add this to help with SQLite connection cleanup
@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')