import requests
import random
from django.core.management.base import BaseCommand
from apps.terrains.models import Terrain
from apps.users.models import User

class Command(BaseCommand):
    help = 'Seed real football terrains from OpenStreetMap for Tunisia'

    def handle(self, *args, **options):
        self.stdout.write("Fetching real football pitches from OpenStreetMap...")
        
        overpass_url = "http://overpass-api.de/api/interpreter"
        overpass_query = """
        [out:json][timeout:30];
        (
          node["leisure"="pitch"]["sport"="soccer"](36.7,10.0,36.9,10.3);
          way["leisure"="pitch"]["sport"="soccer"](36.7,10.0,36.9,10.3);
        );
        out center;
        """
        
        try:
            response = requests.get(overpass_url, params={'data': overpass_query})
            response.raise_for_status()
            data = response.json()
        except Exception as e:
            self.stderr.write(f"Error fetching data: {e}")
            return

        elements = data.get('elements', [])
        self.stdout.write(f"Found {len(elements)} potential terrains.")

        # Get an admin user as owner
        admin_user = User.objects.filter(role='admin').first()
        if not admin_user:
            self.stderr.write("No admin user found to own the terrains.")
            return

        created_count = 0
        for el in elements:
            # Skip if we already have it (approx by coords)
            lat = el.get('lat') or el.get('center', {}).get('lat')
            lon = el.get('lon') or el.get('center', {}).get('lon')
            
            if not lat or not lon:
                continue

            # Check for name, otherwise generic
            tags = el.get('tags', {})
            name = tags.get('name') or tags.get('operator') or f"Terrain Takwira {created_count + 1}"
            
            # Basic address/city info if available
            city = tags.get('addr:city') or "Tunisie"
            address = tags.get('addr:street') or tags.get('name') or "Adresse inconnue"

            # Create terrain
            try:
                # Check if exists nearby
                if Terrain.objects.filter(latitude=lat, longitude=lon).exists():
                    continue

                Terrain.objects.create(
                    name=name,
                    owner=admin_user,
                    address=address,
                    city=city,
                    latitude=lat,
                    longitude=lon,
                    price_per_hour=random.choice([40, 50, 60, 80]),
                    surface_type=random.choice(['synthetic', 'synthetic', 'grass']),
                    capacity=random.choice([10, 12, 14])
                )
                created_count += 1
            except Exception as e:
                self.stdout.write(f"Skipping an item due to error: {e}")

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {created_count} real terrains!"))
