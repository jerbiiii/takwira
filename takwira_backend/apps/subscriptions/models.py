import uuid
from django.db import models

class Plan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True) # 'free', 'pro', 'club'
    price_monthly = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    max_reservations = models.IntegerField(default=10)
    can_create_tournament = models.BooleanField(default=False)
    can_manage_terrain = models.BooleanField(default=False)

    def __str__(self):
        return self.name
