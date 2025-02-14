from celery import shared_task
from django.utils.timezone import now
from .utils.email_utils import send_email
from .models import Campaign

@shared_task(bind=True, max_retries=3)
def send_campaign_emails(self, campaign_id):
    try:
        campaign = Campaign.objects.get(id=campaign_id)
        audience_emails = [user.email for user in campaign.audience.all()]
        send_email(audience_emails, campaign.subject, campaign.content)
        campaign.sent_at = now()
        campaign.save()
    except Exception as e:
        # Retry the task in case of failure
        self.retry(exc=e, countdown=60)