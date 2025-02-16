from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
from decouple import config

# Load environment variables from .env
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')

# Explicitly load the .env file
config.search_path = os.getcwd()  # Ensure decouple looks in the correct directory
SENDGRID_API_KEY = config('SENDGRID_API_KEY', default='NOT_FOUND')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='NOT_FOUND')

print(f"Loaded SendGrid API Key: {SENDGRID_API_KEY}")
print(f"Loaded Default From Email: {DEFAULT_FROM_EMAIL}")

app = Celery('server')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()