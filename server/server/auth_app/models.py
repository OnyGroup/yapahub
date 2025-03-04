from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    phone_number = models.CharField(max_length=15, blank=True, null=True) 

    def __str__(self):
        return f"{self.user.username} Profile"
        
class CxClient(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    company_name = models.CharField(max_length=255, blank=True, null=True)
    industry = models.CharField(max_length=255, blank=True, null=True)
    account_manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="clients")
    created_at = models.DateTimeField(auto_now_add=True) 

    def __str__(self):
        return self.name
    