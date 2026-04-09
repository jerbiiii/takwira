import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from apps.subscriptions.models import Plan

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    ROLE_CHOICES = (
        ('player', 'Joueur'),
        ('admin', 'Admin'),
    )


    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='player')
    subscription_plan = models.ForeignKey(Plan, on_delete=models.SET_NULL, null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    objects = UserManager()
    
    def save(self, *args, **kwargs):
        if not self.subscription_plan:
            try:
                free_plan = Plan.objects.get(name='free')
                self.subscription_plan = free_plan
            except Plan.DoesNotExist:
                pass
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email
