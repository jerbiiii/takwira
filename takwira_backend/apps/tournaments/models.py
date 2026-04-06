import uuid
from django.db import models
from django.conf import settings
from apps.terrains.models import Terrain

class Team(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    captain = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='captain_of')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Tournament(models.Model):
    STATUS_CHOICES = (
        ('open', 'Open for Registration'),
        ('ongoing', 'Ongoing'),
        ('finished', 'Finished'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    organizer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='organized_tournaments')
    terrain = models.ForeignKey(Terrain, on_delete=models.CASCADE, related_name='tournaments')
    start_date = models.DateField()
    end_date = models.DateField()
    max_teams = models.IntegerField(default=8)
    entry_fee = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    teams = models.ManyToManyField(Team, blank=True, related_name='tournaments')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
