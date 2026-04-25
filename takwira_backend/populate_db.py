import os
import django
import pymysql
pymysql.install_as_MySQLdb()
import MySQLdb
MySQLdb.version_info = (2, 1, 1, 'final', 0)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'takwira.settings')
django.setup()

from apps.users.models import User
from apps.subscriptions.models import Plan
from apps.terrains.models import Terrain

def populate():
    # Create or Update plans
    Plan.objects.update_or_create(name='free', defaults={'price_monthly': 0, 'max_reservations': 3, 'can_create_tournament': False, 'can_manage_terrain': False})
    pro, _ = Plan.objects.update_or_create(name='pro', defaults={'price_monthly': 29, 'max_reservations': 9999, 'can_create_tournament': True, 'can_manage_terrain': False})
    club, _ = Plan.objects.update_or_create(name='club', defaults={'price_monthly': 99, 'max_reservations': 9999, 'can_create_tournament': True, 'can_manage_terrain': True})

    # Create users
    admin_pass = os.environ.get('ADMIN_PASSWORD', 'admin123')
    admin, created = User.objects.get_or_create(email='admin@takwira.tn', defaults={'username': 'admin', 'role': 'admin'})
    if created:
        admin.set_password(admin_pass)
        admin.save()

    player_pass = os.environ.get('PLAYER_PASSWORD', 'player123')
    player, created = User.objects.get_or_create(email='player@takwira.tn', defaults={'username': 'player', 'role': 'player', 'subscription_plan': pro})
    if created:
        player.set_password(player_pass)
        player.save()

    # Create Terrains (All owned by admin now)
    Terrain.objects.update_or_create(name='Stade Tunis', owner=admin, defaults={'city': 'Tunis', 'address': 'Centre Ville', 'price_per_hour': 60.00, 'surface_type': 'synthetic'})
    Terrain.objects.update_or_create(name='Stade Sousse', owner=admin, defaults={'city': 'Sousse', 'address': 'Khzema', 'price_per_hour': 50.00, 'surface_type': 'grass'})

    print("DB populated successfully!")

if __name__ == '__main__':
    populate()
