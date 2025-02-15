import random
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.db.models import Q

class Command(BaseCommand):
    help = 'Replaces all @example.com and @yapa.hub emails in the database with real email addresses for testing.'

    def handle(self, *args, **kwargs):
        # List of real email addresses to use
        real_emails = [
            'kelvin.kayoi@ony-group.com',
            'kayveenmurithi@gmail.com',
            'kelvinkayoi@gmail.com'
        ]

        # Fetch all users with placeholder emails
        users_with_placeholder_emails = User.objects.filter(
            Q(email__icontains='@example.com') | Q(email__icontains='@yapa.hub')
        )

        # Update each user's email
        for user in users_with_placeholder_emails:
            # Randomly select one of the real email addresses
            new_email = random.choice(real_emails)
            user.email = new_email
            user.save()

        self.stdout.write(self.style.SUCCESS(f'Successfully updated {users_with_placeholder_emails.count()} emails.'))