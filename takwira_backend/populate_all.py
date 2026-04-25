"""
Takwira - Massive Database Population Script
Run: python populate_all.py
"""
import os
import sys
import random
import django
from datetime import date, time, timedelta, datetime
from decimal import Decimal

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'takwira.settings')
django.setup()

from apps.subscriptions.models import Plan
from apps.users.models import User
from apps.terrains.models import Terrain
from apps.reservations.models import Reservation
from apps.reviews.models import Review
from apps.tournaments.models import Tournament, Team, Match, TournamentRequest, JoinRequest

def populate():
    print("Cleaning database...")
    Match.objects.all().delete()
    JoinRequest.objects.all().delete()
    TournamentRequest.objects.all().delete()
    Team.objects.all().delete()
    Tournament.objects.all().delete()
    Review.objects.all().delete()
    Reservation.objects.all().delete()
    Terrain.objects.all().delete()
    User.objects.filter(is_superuser=False).delete()

    # --- PLANS ---
    print("Creating plans...")
    free_plan, _ = Plan.objects.get_or_create(name='free', defaults={'price_monthly': 0, 'max_reservations': 3, 'can_create_tournament': False, 'can_manage_terrain': False})
    pro_plan, _ = Plan.objects.get_or_create(name='pro', defaults={'price_monthly': 29, 'max_reservations': 999, 'can_create_tournament': True, 'can_manage_terrain': False})
    club_plan, _ = Plan.objects.get_or_create(name='club', defaults={'price_monthly': 79, 'max_reservations': 999, 'can_create_tournament': True, 'can_manage_terrain': True})

    # --- ADMIN ---
    print("Creating admin...")
    admin = User.objects.filter(is_superuser=True).first()
    if not admin:
        admin = User.objects.create_superuser(email='admin@takwira.tn', password='admin123', username='admin')
    admin.subscription_plan = club_plan
    admin.save()

    # --- CLUB OWNERS ---
    print("Creating terrain owners...")
    owners = []
    for i in range(5):
        u = User.objects.create_user(
            email=f'owner{i}@takwira.tn', password='owner123', username=f'owner{i}',
            role='player', subscription_plan=club_plan
        )
        owners.append(u)

    # --- PLAYERS ---
    print("Creating massive player pool...")
    first_names = ['Ahmed', 'Sami', 'Youssef', 'Hamza', 'Ferjani', 'Wahbi', 'Ali', 'Naim', 'Ellyes', 'Anis', 'Seif', 'Issam', 'Ghaylen', 'Dylan', 'Montassar', 'Hannibal', 'Mohamed', 'Bilel', 'Karim', 'Amine', 'Rami', 'Oussama', 'Zied', 'Khaled', 'Maher', 'Nabil', 'Sofiane', 'Yassine', 'Mehdi', 'Riyad', 'Hakim', 'Achraf', 'Tarek', 'Faouzi', 'Radhi', 'Hatem', 'Zoubeir', 'Adel', 'Selim', 'Mourad']
    last_names = ['Ben Ali', 'Trabelsi', 'Msakni', 'Mathlouthi', 'Sassi', 'Khazri', 'Maaloul', 'Sliti', 'Skhiri', 'Slimane', 'Jaziri', 'Jebali', 'Chaalali', 'Bronn', 'Talbi', 'Mejbri', 'Drager', 'Ifa', 'Haggui', 'Chermiti', 'Bedoui', 'Darragi', 'Boughedir', 'Mouelhi', 'Hannachi', 'Maaloul', 'Feghouli', 'Bounou', 'Benatia', 'Mahrez', 'Ziyech', 'Hakimi', 'Dhiab', 'Rouissi', 'Jaidi', 'Trabelsi', 'Baya', 'Sellimi', 'Ben Achour', 'Melki']
    
    players = []
    for i in range(80):
        fname = random.choice(first_names)
        lname = random.choice(last_names)
        uname = f"{fname.lower()}{i}"
        plan = random.choices([free_plan, pro_plan], weights=[70, 30])[0]
        u = User.objects.create_user(
            email=f'{uname}@takwira.tn', password='player123', username=uname,
            first_name=fname, last_name=lname,
            role='player', subscription_plan=plan
        )
        players.append(u)

    # --- TERRAINS ---
    print("Creating diverse terrains...")
    terrain_names = [
        ('Stade El Menzah', 'Tunis'), ('Arena Foot Lac', 'Tunis'), ('City Stade Marsa', 'La Marsa'),
        ('Complexe Sportif Sousse', 'Sousse'), ('Terrain Etoile Sahel', 'Sousse'), ('Stade Olympique Sfax', 'Sfax'),
        ('Terrain El Ain Sfax', 'Sfax'), ('Hammamet Sport', 'Hammamet'), ('Nabeul Football', 'Nabeul'),
        ('Stade Municipal Bizerte', 'Bizerte'), ('Terrain Megrine', 'Ben Arous'), ('Foot Indoor Ariana', 'Ariana'),
        ('Terrain Manouba', 'Manouba'), ('Gabes Sport Arena', 'Gabes'), ('Complexe Djerba', 'Medenine'),
        ('Monastir City Foot', 'Monastir'), ('Kairouan Arena', 'Kairouan'), ('Tozeur Oasis Foot', 'Tozeur')
    ]
    
    terrains = []
    for name, city in terrain_names:
        owner = random.choice(owners + [admin])
        t = Terrain.objects.create(
            name=name, owner=owner, address=f"Rue de {name}, {city}", city=city,
            latitude=Decimal(random.uniform(33, 37)), longitude=Decimal(random.uniform(8, 11)),
            surface_type=random.choice(['grass', 'synthetic', 'concrete']),
            capacity=random.choice([10, 14, 22]), 
            price_per_hour=Decimal(random.randint(40, 150)), 
            is_active=True
        )
        terrains.append(t)

    # --- RESERVATIONS ---
    print("Generating 300+ reservations...")
    today = date.today()
    for _ in range(350):
        terrain = random.choice(terrains)
        player = random.choice(players)
        # History spans last 6 months to next 1 month
        d = today - timedelta(days=random.randint(-30, 180))
        h = random.randint(8, 22)
        status = random.choices(['confirmed', 'pending', 'cancelled'], weights=[80, 10, 10])[0]
        Reservation.objects.create(
            terrain=terrain, player=player, player_name=player.username,
            date=d, start_time=time(h, 0), end_time=time(h + 1, 0),
            status=status,
            total_price=terrain.price_per_hour
        )

    # --- REVIEWS ---
    print("Generating reviews...")
    comments = ["Excellent!", "Terrain au top", "Un peu cher", "Super eclairage", "Vestiaires propres", "Proprietaire sympa", "Gazon magnifique"]
    for t in terrains:
        num_reviews = random.randint(5, 15)
        reviewers = random.sample(players, num_reviews)
        for p in reviewers:
            Review.objects.create(
                terrain=t, user=p,
                rating=random.randint(3, 5),
                comment=random.choice(comments)
            )

    # --- TOURNAMENTS ---
    print("Creating tournaments (Active, Finished, Archived)...")
    
    # 1. Archived Tournament (Finished 10 days ago)
    archived_date = today - timedelta(days=10)
    t_archived = Tournament.objects.create(
        name='Championnat Hiver 2025', organizer=admin, terrain=terrains[0],
        start_date=archived_date - timedelta(days=20), end_date=archived_date,
        max_teams=8, entry_fee=40, status='finished', tournament_type='knockout',
        completed_at=datetime.combine(archived_date, time(20, 0))
    )
    
    # 2. Recently Finished (Finished 2 days ago - NOT yet archived)
    recent_date = today - timedelta(days=2)
    t_recent = Tournament.objects.create(
        name='Coupe du Printemps', organizer=admin, terrain=terrains[1],
        start_date=recent_date - timedelta(days=10), end_date=recent_date,
        max_teams=8, entry_fee=60, status='finished', tournament_type='knockout',
        completed_at=datetime.combine(recent_date, time(21, 0))
    )
    
    # 3. Ongoing Tournament
    t_ongoing = Tournament.objects.create(
        name='Takwira Pro League', organizer=admin, terrain=terrains[2],
        start_date=today - timedelta(days=5), end_date=today + timedelta(days=15),
        max_teams=16, entry_fee=100, status='ongoing', tournament_type='knockout'
    )

    # Populate Teams for Tournament 3 (Ongoing)
    for i in range(16):
        team = Team.objects.create(name=f"Elite FC {i}", captain=players[i])
        t_ongoing.teams.add(team)
        # Create some group matches for ongoing
        if i % 2 == 0:
            Match.objects.create(
                tournament=t_ongoing, team1=team, team2=None, 
                score1=0, score2=0, status='scheduled', 
                phase='group', round_name='Phase de Poules'
            )

    # --- REQUESTS ---
    print("Creating tournament requests...")
    for i in range(5):
        TournamentRequest.objects.create(
            creator=random.choice(players), terrain=random.choice(terrains),
            name=f'Request {i}', start_date=today + timedelta(days=60),
            max_teams=random.choice([8, 16]), entry_fee=random.randint(10, 50),
            status=random.choice(['pending', 'approved', 'rejected'])
        )

    print("\nDATABASE POPULATED SUCCESSFULLY!")

if __name__ == "__main__":
    populate()
