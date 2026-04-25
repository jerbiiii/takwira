import os
import django
from datetime import date, timedelta
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'takwira.settings')
django.setup()

from apps.tournaments.models import Tournament, Team, Match
from apps.terrains.models import Terrain
from django.contrib.auth import get_user_model

User = get_user_model()

def setup():
    print("Clearing existing tournaments and teams...")
    Tournament.objects.all().delete()
    Team.objects.all().delete()
    Match.objects.all().delete()

    admin = User.objects.get(username='admin')
    users = list(User.objects.exclude(username='admin')[:24])
    terrain1 = Terrain.objects.get(name='Stade El Menzah')
    terrain2 = Terrain.objects.get(name='Arena Foot Lac')

    # 1. Tournament 16 teams (Pool -> 1/8 -> Quarter -> Semi -> Final)
    print("Creating Tournament 1 (16 teams)...")
    t16 = Tournament.objects.create(
        name="Ligue des Champions Takwira",
        organizer=admin,
        terrain=terrain1,
        start_date=date.today(),
        end_date=date.today() + timedelta(days=7),
        max_teams=16,
        entry_fee=50.00,
        status='open'
    )
    
    for i in range(16):
        team = Team.objects.create(name=f"Team {users[i].username.title()}", captain=users[i])
        t16.teams.add(team)
    
    print("Tournament 1 created with 16 teams.")

    # 2. Tournament 8 teams (Quarter -> Semi -> Final)
    print("Creating Tournament 2 (8 teams)...")
    t8 = Tournament.objects.create(
        name="Coupe d'Été 8",
        organizer=admin,
        terrain=terrain2,
        start_date=date.today(),
        end_date=date.today() + timedelta(days=3),
        max_teams=8,
        entry_fee=30.00,
        status='open'
    )
    
    for i in range(8):
        team = Team.objects.create(name=f"Power {users[i+8].username.title()}", captain=users[i+8])
        t8.teams.add(team)
    
    print("Tournament 2 created with 8 teams.")

if __name__ == '__main__':
    setup()
