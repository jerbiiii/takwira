import os
import django
import pymysql
from datetime import date, timedelta
pymysql.install_as_MySQLdb()

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'takwira.settings')
django.setup()

from apps.users.models import User
from apps.tournaments.models import Tournament, Team, Match
from apps.terrains.models import Terrain

def populate_tournaments():
    admin = User.objects.get(email='admin@takwira.tn')
    terrain = Terrain.objects.first()

    # Create a League Tournament
    league, created = Tournament.objects.get_or_create(
        name='Ligue des Champions Takwira',
        defaults={
            'organizer': admin,
            'terrain': terrain,
            'start_date': date.today(),
            'end_date': date.today() + timedelta(days=30),
            'max_teams': 4,
            'tournament_type': 'league',
            'status': 'ongoing'
        }
    )

    if created:
        # Create Teams
        team1 = Team.objects.create(name='Eagles FC', captain=admin)
        team2 = Team.objects.create(name='Lions United', captain=admin)
        team3 = Team.objects.create(name='Desert Hawks', captain=admin)
        team4 = Team.objects.create(name='Tunis Stars', captain=admin)

        league.teams.add(team1, team2, team3, team4)

        # Create some finished matches
        Match.objects.create(tournament=league, team1=team1, team2=team2, score1=2, score2=1, status='finished', round_name='Journée 1')
        Match.objects.create(tournament=league, team1=team3, team2=team4, score1=0, score2=0, status='finished', round_name='Journée 1')
        
        # Create an ongoing match
        Match.objects.create(tournament=league, team1=team1, team2=team3, score1=1, score2=0, status='ongoing', round_name='Journée 2')

    # Create a Knockout Tournament
    knockout, created = Tournament.objects.get_or_create(
        name='Coupe Takwira Knockout',
        defaults={
            'organizer': admin,
            'terrain': terrain,
            'start_date': date.today(),
            'end_date': date.today() + timedelta(days=10),
            'max_teams': 8,
            'tournament_type': 'knockout',
            'status': 'ongoing'
        }
    )

    if created:
        t1 = Team.objects.create(name='Titans', captain=admin)
        t2 = Team.objects.create(name='Avengers', captain=admin)
        t3 = Team.objects.create(name='Shadows', captain=admin)
        t4 = Team.objects.create(name='Phantoms', captain=admin)
        
        knockout.teams.add(t1, t2, t3, t4)

        # Semi-finals
        Match.objects.create(tournament=knockout, team1=t1, team2=t2, score1=3, score2=2, status='finished', round_name='Demi-finale')
        Match.objects.create(tournament=knockout, team1=t3, team2=t4, score1=1, score2=4, status='finished', round_name='Demi-finale')
        
        # Final (Scheduled)
        Match.objects.create(tournament=knockout, team1=t1, team2=t4, score1=0, score2=0, status='scheduled', round_name='Finale')

    print("Tournaments populated successfully!")

if __name__ == '__main__':
    populate_tournaments()
