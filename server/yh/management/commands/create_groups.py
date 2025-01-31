# yh/management/commands/create_groups.py
from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group

class Command(BaseCommand):
    help = "Creates default user groups"

    def handle(self, *args, **kwargs):
        # Create groups
        Group.objects.get_or_create(name="Business Owners")
        Group.objects.get_or_create(name="Agents")
        Group.objects.get_or_create(name="Customers")

        self.stdout.write(self.style.SUCCESS("Successfully created groups!"))