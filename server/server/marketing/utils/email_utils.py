from decouple import config
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

def send_email(to_emails, subject, html_content):
    """
    Sends an email using SendGrid.
    :param to_emails: List of recipient email addresses.
    :param subject: Subject of the email.
    :param html_content: HTML content of the email.
    """
    # Load environment variables with fallback values
    SENDGRID_API_KEY = config('SENDGRID_API_KEY', default='NOT_FOUND')
    DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='NOT_FOUND')

    # Create the email message
    message = Mail(
        from_email=DEFAULT_FROM_EMAIL,
        to_emails=to_emails,
        subject=subject,
        html_content=html_content
    )

    try:
        # Initialize the SendGrid client and send the email
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)

        # Log success and status code
        print(f"Email sent successfully! Status Code: {response.status_code}")
    except Exception as e:
        # Log any errors that occur
        print(f"Failed to send email: {e}")