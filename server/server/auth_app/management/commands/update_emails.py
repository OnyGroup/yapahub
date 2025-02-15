import random
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.db.models import Q

class Command(BaseCommand):
    help = 'Appends unique identifiers to real email addresses in the database for testing.'

    def handle(self, *args, **kwargs):
        # List of real email addresses to use
        real_emails = [
            'kelvin.kayoi@ony-group.com',
            'kayveenmurithi@gmail.com',
            'kelvinkayoi@gmail.com'
        ]

        # Fetch all users with placeholder emails
        users_with_placeholder_emails = User.objects.filter(
            Q(email__icontains='@ony-group.com') | Q(email__icontains='@gmail.com')
        )

        # Update each user's email with a unique real email
        for i, user in enumerate(users_with_placeholder_emails):
            base_email = random.choice(real_emails)
            username, domain = base_email.split('@')
            new_email = f"{username}+{i + 1}@{domain}"  # Add unique identifier
            user.email = new_email
            user.save()

        self.stdout.write(self.style.SUCCESS(f'Successfully updated {users_with_placeholder_emails.count()} emails.'))