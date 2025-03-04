from django.db.models.signals import post_save, post_migrate
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserProfile
from django.contrib.auth.models import Group

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

@receiver(post_migrate)
def create_default_groups(sender, **kwargs):
    if sender.name == 'auth_app':  # Ensures it only runs for this app
        groups = ["Admins", "Business Owners", "Agents", "Customers", "Account Managers"]
        for group_name in groups:
            Group.objects.get_or_create(name=group_name)