from django.db import models
from django.contrib.auth.models import User

class Agent(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    version = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    agent_file = models.FileField(upload_to='agent_files/', null=True, blank=True) # Stores the uploaded agent file
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Transaction(models.Model):
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE)
    buyer = models.ForeignKey(User, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Transaction {self.id} for {self.agent.name} by {self.buyer.username}"

# UserProfile Model
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    # Address fields (can be blank/null if not always required)
    address_line1 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    zip_code = models.CharField(max_length=20, blank=True, null=True)
    # Profile picture URL (optional)
    profile_picture_url = models.URLField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

# Signal to create or update UserProfile whenever a User instance is saved.
@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
    # Ensure profile is saved, especially if User model has non-profile fields that trigger post_save
    # For existing users, this ensures profile.save() is called if the User is saved.
    # However, if UserProfile fields are updated via UserProfileSerializer, this signal on User won't help.
    # The primary purpose here is auto-creation. Updates to UserProfile should go through its own serializer/view.
    # A common pattern is just to create it:
    # if created:
    #     UserProfile.objects.create(user=instance)
    # else:
    #     # Ensure profile exists for older users who might not have one
    #     UserProfile.objects.get_or_create(user=instance) # This line is redundant if created implies profile creation
    # The original signal is fine for auto-creation.
    # Let's stick to the provided one, which also calls profile.save()
    # This might be useful if User model changes could affect profile state implicitly, though less common.
    try:
        instance.profile.save()
    except UserProfile.DoesNotExist: # Handle case for existing users that might somehow not have a profile
        UserProfile.objects.create(user=instance)

import uuid
from django.conf import settings

class Order(models.Model):
    ORDER_STATUS_CHOICES = [
        ('pending_payment', 'Pending Payment'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]

    order_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='orders')
    agent = models.ForeignKey('Agent', on_delete=models.PROTECT, related_name='orders')
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default='pending_payment')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.order_id} by {self.buyer.username} for {self.agent.name}"
