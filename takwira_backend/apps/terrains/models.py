import uuid
from django.db import models
from django.conf import settings

class TerrainImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    image = models.ImageField(upload_to='terrains/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.id)

class Terrain(models.Model):
    SURFACE_CHOICES = (
        ('grass', 'Gazon Naturel'),
        ('synthetic', 'Gazon Synthétique'),
        ('concrete', 'Béton / City Stade'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='terrains')
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    surface_type = models.CharField(max_length=20, choices=SURFACE_CHOICES, default='synthetic')
    capacity = models.IntegerField(default=10) # 5v5 => 10
    price_per_hour = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    images = models.ManyToManyField(TerrainImage, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.city})"
