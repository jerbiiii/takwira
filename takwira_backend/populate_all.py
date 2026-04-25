"""
Takwira - Comprehensive Database Population Script
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

# --- PLAYERS ---
print("Creating players...")
player_data = [
    ('ahmed', 'Ahmed Ben Ali'), ('sami', 'Sami Trabelsi'), ('youssef', 'Youssef Msakni'),
    ('hamza', 'Hamza Mathlouthi'), ('ferjani', 'Ferjani Sassi'), ('wahbi', 'Wahbi Khazri'),
    ('ali', 'Ali Maaloul'), ('naim', 'Naim Sliti'), ('ellyes', 'Ellyes Skhiri'),
    ('anis', 'Anis Slimane'), ('seif', 'Seif Jaziri'), ('issam', 'Issam Jebali'),
    ('ghaylen', 'Ghaylen Chaalali'), ('dylan', 'Dylan Bronn'), ('montassar', 'Montassar Talbi'),
    ('hannibal', 'Hannibal Mejbri'), ('mohamed', 'Mohamed Drager'), ('bilel', 'Bilel Ifa'),
    ('karim', 'Karim Haggui'), ('amine', 'Amine Chermiti'), ('rami', 'Rami Bedoui'),
    ('oussama', 'Oussama Darragi'), ('zied', 'Zied Boughedir'), ('khaled', 'Khaled Mouelhi'),
    ('maher', 'Maher Hannachi'), ('nabil', 'Nabil Maaloul'), ('sofiane', 'Sofiane Feghouli'),
    ('yassine', 'Yassine Bounou'), ('mehdi', 'Mehdi Benatia'), ('riyad', 'Riyad Mahrez'),
    ('hakim', 'Hakim Ziyech'), ('achraf', 'Achraf Hakimi'),
]
players = []
for i, (uname, fullname) in enumerate(player_data):
    parts = fullname.split(' ', 1)
    plan = pro_plan if i < 8 else free_plan
    try:
        u = User.objects.get(email=f'{uname}@takwira.tn')
    except User.DoesNotExist:
        u = User.objects.create_user(
            email=f'{uname}@takwira.tn', password='player123', username=uname,
            first_name=parts[0], last_name=parts[1] if len(parts) > 1 else '',
            role='player', subscription_plan=plan
        )
    players.append(u)
print(f"   - {len(players)} players created")

# --- TERRAINS ---
print("Creating terrains...")
terrain_data = [
    ('Stade El Menzah', 'Tunis', 'Rue du Stade, El Menzah', 36.8190, 10.1658, 'grass', 22, 120),
    ('Arena Foot Lac', 'Tunis', 'Les Berges du Lac 1', 36.8342, 10.2247, 'synthetic', 14, 80),
    ('City Stade Marsa', 'La Marsa', 'Avenue Habib Bourguiba', 36.8785, 10.3247, 'synthetic', 10, 60),
    ('Complexe Sportif Sousse', 'Sousse', 'Route de la Corniche', 35.8256, 10.6084, 'grass', 22, 100),
    ('Terrain Etoile Sahel', 'Sousse', 'Rue de l\'Etoile', 35.8288, 10.5927, 'synthetic', 14, 70),
    ('Stade Olympique Sfax', 'Sfax', 'Avenue 5 Aout', 34.7406, 10.7603, 'grass', 22, 90),
    ('Terrain El Ain Sfax', 'Sfax', 'Route El Ain', 34.7500, 10.7700, 'synthetic', 10, 50),
    ('Hammamet Sport', 'Hammamet', 'Zone touristique', 36.4000, 10.6167, 'synthetic', 14, 75),
    ('Nabeul Football', 'Nabeul', 'Centre Ville', 36.4514, 10.7352, 'grass', 22, 85),
    ('Stade Municipal Bizerte', 'Bizerte', 'Avenue de la Republique', 37.2744, 9.8739, 'grass', 22, 95),
    ('Terrain Megrine', 'Ben Arous', 'Route de Megrine', 36.7700, 10.2300, 'synthetic', 10, 55),
    ('Foot Indoor Ariana', 'Ariana', 'Centre Urbain Nord', 36.8600, 10.1900, 'synthetic', 10, 65),
    ('Terrain Manouba', 'Manouba', 'Rue de la Liberte', 36.8100, 10.0900, 'concrete', 10, 40),
    ('Gabes Sport Arena', 'Gabes', 'Avenue Farhat Hached', 33.8815, 10.0982, 'synthetic', 14, 60),
    ('Complexe Djerba', 'Medenine', 'Houmt Souk', 33.8750, 10.8573, 'grass', 22, 80),
]
terrains = []
for name, city, addr, lat, lng, surf, cap, price in terrain_data:
    t = Terrain.objects.create(
        name=name, owner=admin, address=addr, city=city,
        latitude=lat, longitude=lng, surface_type=surf,
        capacity=cap, price_per_hour=Decimal(str(price)), is_active=True
    )
    terrains.append(t)
print(f"   - {len(terrains)} terrains created")

# --- RESERVATIONS ---
print("Creating reservations...")
statuses = ['confirmed', 'confirmed', 'confirmed', 'pending', 'cancelled']
res_count = 0
for i in range(80):
    terrain = random.choice(terrains)
    player = random.choice(players)
    d = date.today() - timedelta(days=random.randint(-14, 30))
    h = random.randint(8, 20)
    Reservation.objects.create(
        terrain=terrain, player=player, player_name=player.username,
        date=d, start_time=time(h, 0), end_time=time(h + 1, 0),
        status=random.choice(statuses),
        total_price=terrain.price_per_hour
    )
    res_count += 1
print(f"   - {res_count} reservations created")

# --- REVIEWS ---
print("Creating reviews...")
rev_count = 0
comments = [
    "Excellent terrain, gazon parfait !", "Tres bon rapport qualite-prix.",
    "Eclairage nocturne top, vestiaires propres.", "Terrain un peu use mais correct.",
    "Le meilleur terrain de la ville !", "Accueil chaleureux, je recommande.",
    "Sol glissant par temps de pluie.", "Rien a dire, parfait pour nos matchs.",
    "Bonne ambiance, terrain bien entretenu.", "Parking pratique, acces facile.",
    "Un peu cher mais la qualite est la.", "Nous y jouons chaque semaine !",
]
used = set()
for terrain in terrains:
    for _ in range(random.randint(3, 8)):
        player = random.choice(players)
        key = (terrain.id, player.id)
        if key in used:
            continue
        used.add(key)
        Review.objects.create(
            terrain=terrain, user=player,
            rating=random.choices([3, 4, 4, 5, 5, 5], k=1)[0],
            comment=random.choice(comments)
        )
        rev_count += 1
print(f"   - {rev_count} reviews created")

# --- TOURNAMENTS ---
print("Creating tournaments...")

# TOURNAMENT 1: Poules + Knockout (Finished)
t1 = Tournament.objects.create(
    name='Coupe Takwira 2026', organizer=admin, terrain=terrains[0],
    start_date=date(2026, 3, 1), end_date=date(2026, 3, 15),
    max_teams=16, entry_fee=50, status='finished', tournament_type='knockout'
)
team_names_t1 = [
    'FC Tunis', 'AS Marsa', 'Etoile du Sahel', 'CS Sfaxien',
    'Club Africain', 'ES Tunis', 'US Monastir', 'CA Bizertin',
    'Olympique Beja', 'JS Kabylie', 'AS Soliman', 'Stade Tunisien',
    'US Ben Guerdane', 'SS Sfaxien', 'AS Gabes', 'CO Medenine'
]
teams_t1 = []
for i, tn in enumerate(team_names_t1):
    team = Team.objects.create(name=tn, captain=players[i % len(players)])
    t1.teams.add(team)
    teams_t1.append(team)

# Group stage
groups = {'Groupe A': teams_t1[0:4], 'Groupe B': teams_t1[4:8], 'Groupe C': teams_t1[8:12], 'Groupe D': teams_t1[12:16]}
match_order = 0
for gname, gteams in groups.items():
    for i in range(len(gteams)):
        for j in range(i + 1, len(gteams)):
            s1, s2 = random.randint(0, 4), random.randint(0, 3)
            Match.objects.create(
                tournament=t1, team1=gteams[i], team2=gteams[j],
                score1=s1, score2=s2, status='finished',
                phase='group', group_name=gname,
                round_name=gname, order=match_order,
                match_date=datetime(2026, 3, 1 + match_order % 5, 14 + match_order % 4, 0)
            )
            match_order += 1

# QF
qf_teams = []
for gname, gteams in groups.items():
    qf_teams.extend(gteams[:2])
random.shuffle(qf_teams)
qf_winners = []
for i in range(0, 8, 2):
    s1, s2 = random.randint(0, 3), random.randint(0, 3)
    while s1 == s2: s1, s2 = random.randint(0, 3), random.randint(0, 3)
    winner = qf_teams[i] if s1 > s2 else qf_teams[i + 1]
    qf_winners.append(winner)
    Match.objects.create(
        tournament=t1, team1=qf_teams[i], team2=qf_teams[i + 1],
        score1=s1, score2=s2, status='finished',
        phase='quarter', group_name='', round_name='Quarts de finale',
        order=i // 2, match_date=datetime(2026, 3, 10, 16 + i // 2, 0)
    )

# SF
sf_winners = []
for i in range(0, 4, 2):
    s1, s2 = random.randint(0, 3), random.randint(0, 3)
    while s1 == s2: s1, s2 = random.randint(0, 3), random.randint(0, 3)
    winner = qf_winners[i] if s1 > s2 else qf_winners[i + 1]
    sf_winners.append(winner)
    Match.objects.create(
        tournament=t1, team1=qf_winners[i], team2=qf_winners[i + 1],
        score1=s1, score2=s2, status='finished',
        phase='semi', group_name='', round_name='Demi-finales',
        order=i // 2, match_date=datetime(2026, 3, 13, 17 + i // 2, 0)
    )

# Final
s1, s2 = random.randint(0, 3), random.randint(0, 3)
while s1 == s2: s1, s2 = random.randint(0, 3), random.randint(0, 3)
Match.objects.create(
    tournament=t1, team1=sf_winners[0], team2=sf_winners[1],
    score1=s1, score2=s2, status='finished',
    phase='final', group_name='', round_name='Finale',
    order=0, match_date=datetime(2026, 3, 15, 19, 0)
)
print("   - Coupe Takwira 2026 created")

# TOURNAMENT 2: Ongoing, live quarters
t2 = Tournament.objects.create(
    name='Liga Ramadan 2026', organizer=admin, terrain=terrains[3],
    start_date=date(2026, 4, 20), end_date=date(2026, 5, 5),
    max_teams=16, entry_fee=30, status='ongoing', tournament_type='knockout'
)
team_names_t2 = [
    'Hilal Sousse', 'Najm Metlaoui', 'Avenir Sportif', 'Espoir Zarzis',
    'Stade Gabesien', 'AS Djerba', 'US Tataouine', 'JS Kairouanaise',
    'Olympique Sidi Bouzid', 'AS Kasserine', 'ES Hammam-Sousse', 'CS Hammam-Lif',
    'AS Oued Ellil', 'Racing Beja', 'SA Menzel Bourguiba', 'RS Berkane'
]
teams_t2 = []
for i, tn in enumerate(team_names_t2):
    team = Team.objects.create(name=tn, captain=players[(i + 5) % len(players)])
    t2.teams.add(team)
    teams_t2.append(team)

groups2 = {'Groupe A': teams_t2[0:4], 'Groupe B': teams_t2[4:8], 'Groupe C': teams_t2[8:12], 'Groupe D': teams_t2[12:16]}
mo = 0
for gname, gteams in groups2.items():
    for i in range(len(gteams)):
        for j in range(i + 1, len(gteams)):
            s1, s2 = random.randint(0, 3), random.randint(0, 3)
            Match.objects.create(
                tournament=t2, team1=gteams[i], team2=gteams[j],
                score1=s1, score2=s2, status='finished',
                phase='group', group_name=gname, round_name=gname, order=mo,
                match_date=datetime(2026, 4, 20 + mo % 5, 15, 0)
            )
            mo += 1

qf2 = []
for gname, gteams in groups2.items():
    qf2.extend(gteams[:2])
random.shuffle(qf2)
for i in range(0, 8, 2):
    is_live = i >= 4
    s1, s2 = random.randint(0, 2), random.randint(0, 2)
    if not is_live:
        while s1 == s2: s1, s2 = random.randint(0, 3), random.randint(0, 3)
    Match.objects.create(
        tournament=t2, team1=qf2[i], team2=qf2[i+1],
        score1=s1, score2=s2, status='ongoing' if is_live else 'finished',
        phase='quarter', group_name='', round_name='Quarts de finale',
        order=i // 2, match_date=datetime(2026, 4, 25, 16 + i // 2, 0)
    )

Match.objects.create(tournament=t2, team1=None, team2=None, score1=0, score2=0, status='scheduled', phase='semi', round_name='Demi-finales', order=0)
Match.objects.create(tournament=t2, team1=None, team2=None, score1=0, score2=0, status='scheduled', phase='semi', round_name='Demi-finales', order=1)
Match.objects.create(tournament=t2, team1=None, team2=None, score1=0, score2=0, status='scheduled', phase='final', round_name='Finale', order=0)
print("   - Liga Ramadan 2026 created")

# TOURNAMENT 4: League
t4 = Tournament.objects.create(
    name='Ligue des Quartiers', organizer=admin, terrain=terrains[1],
    start_date=date(2026, 4, 1), end_date=date(2026, 5, 30),
    max_teams=6, entry_fee=20, status='ongoing', tournament_type='league'
)
league_teams = []
for i, tn in enumerate(['Bab Souika FC', 'Medina Stars', 'Bardo United', 'Carthage XI', 'El Omrane City', 'Mutuelleville SC']):
    team = Team.objects.create(name=tn, captain=players[(i + 15) % len(players)])
    t4.teams.add(team)
    league_teams.append(team)

lo = 0
for i in range(len(league_teams)):
    for j in range(i + 1, len(league_teams)):
        done = random.random() < 0.6
        s1, s2 = (random.randint(0, 4), random.randint(0, 3)) if done else (0, 0)
        Match.objects.create(
            tournament=t4, team1=league_teams[i], team2=league_teams[j],
            score1=s1, score2=s2, status='finished' if done else 'scheduled',
            phase='group', group_name='Ligue', round_name='Journee',
            order=lo, match_date=datetime(2026, 4, 5 + lo, 18, 0)
        )
        lo += 1
print("   - Ligue des Quartiers created")

# --- REQUESTS ---
print("Creating requests...")
TournamentRequest.objects.create(creator=players[0], terrain=terrains[2], name='Coupe El Marsa', start_date=date(2026, 8, 1), max_teams=8, entry_fee=15, status='pending')
TournamentRequest.objects.create(creator=players[2], terrain=terrains[4], name='Challenge Sahel', start_date=date(2026, 9, 15), max_teams=16, entry_fee=50, status='approved')
print("   - Requests created")

print("\nDatabase populated successfully!")
