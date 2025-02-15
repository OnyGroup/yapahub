import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

def send_email(to_emails, subject, html_content):
    """
    Sends an email using SendGrid.
    :param to_emails: List of recipient email addresses.
    :param subject: Subject of the email.
    :param html_content: HTML content of the email.
    """
    message = Mail(
        from_email=os.getenv('DEFAULT_FROM_EMAIL'),
        to_emails=to_emails,
        subject=subject,
        html_content=html_content
    )
    try:
        sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
        response = sg.send(message)
        print(f"Email sent successfully! Status Code: {response.status_code}")
    except Exception as e:
        print(f"Failed to send email: {e}")
