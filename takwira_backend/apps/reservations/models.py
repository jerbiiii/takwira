import uuid
from django.db import models
from django.conf import settings
from apps.terrains.models import Terrain

class Reservation(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled')
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    terrain = models.ForeignKey(Terrain, on_delete=models.CASCADE, related_name='reservations')
    player = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reservations')
    player_name = models.CharField(max_length=100, blank=True) # Custom name for the match
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_price = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.player} reserved {self.terrain} on {self.date}"
