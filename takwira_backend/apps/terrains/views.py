from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Terrain
from .serializers import TerrainSerializer
from apps.users.permissions import IsAdminUser
from apps.reservations.models import Reservation
from apps.tournaments.models import Tournament
from datetime import date, timedelta
import calendar
from math import radians, cos, sin, asin, sqrt

class TerrainViewSet(viewsets.ModelViewSet):
    queryset = Terrain.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = TerrainSerializer

    def get_permissions(self):
        # Only admin can create, update, or delete terrains
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        if self.action == 'occupied_dates':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticatedOrReadOnly()]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def get_queryset(self):
        queryset = super().get_queryset()
        city = self.request.query_params.get('city')
        lat = self.request.query_params.get('lat')
        lng = self.request.query_params.get('lng')
        dist = self.request.query_params.get('dist', 20) # Default 20km

        if city:
            queryset = queryset.filter(city__icontains=city)

        if lat and lng:
            try:
                lat = float(lat)
                lng = float(lng)
                dist = float(dist)
                
                # Bounding box filter (approximate but fast)
                # 1 degree latitude is roughly 111km
                lat_offset = dist / 111.0
                # 1 degree longitude is 111km * cos(lat)
                lng_offset = dist / (111.0 * cos(radians(lat)))
                
                queryset = queryset.filter(
                    latitude__gte=lat - abs(lat_offset),
                    latitude__lte=lat + abs(lat_offset),
                    longitude__gte=lng - abs(lng_offset),
                    longitude__lte=lng + abs(lng_offset)
                )
            except (ValueError, TypeError):
                pass
                
        return queryset

    @action(detail=True, methods=['get'], url_path='occupied-dates')
    def occupied_dates(self, request, pk=None):
        """
        Returns all occupied dates for a terrain in a given month range.
        Query params: year (int), month (int)
        Returns: { occupied_dates: [ { date: "YYYY-MM-DD", reason: "..." }, ... ] }
        """
        terrain = self.get_object()
        
        try:
            year = int(request.query_params.get('year', date.today().year))
            month = int(request.query_params.get('month', date.today().month))
        except (ValueError, TypeError):
            return Response({'detail': 'Invalid year or month'}, status=status.HTTP_400_BAD_REQUEST)

        # Get the date range for the requested month
        _, last_day = calendar.monthrange(year, month)
        month_start = date(year, month, 1)
        month_end = date(year, month, last_day)

        occupied = {}

        # 1. Find confirmed reservations in this month
        reservations = Reservation.objects.filter(
            terrain=terrain,
            date__range=(month_start, month_end),
            status='confirmed'
        )
        for res in reservations:
            date_str = res.date.isoformat()
            if date_str not in occupied:
                occupied[date_str] = {
                    'date': date_str,
                    'reason': 'Réservation confirmée',
                    'type': 'reservation',
                    'slots': []
                }
            occupied[date_str]['slots'].append({
                'start': res.start_time.strftime('%H:%M'),
                'end': res.end_time.strftime('%H:%M')
            })

        # 2. Find active tournaments overlapping this month
        tournaments = Tournament.objects.filter(
            terrain=terrain,
            status__in=['open', 'ongoing'],
            start_date__lte=month_end,
            end_date__gte=month_start
        )
        for tournament in tournaments:
            # Mark each day of the tournament within this month
            t_start = max(tournament.start_date, month_start)
            t_end = min(tournament.end_date, month_end)
            current = t_start
            while current <= t_end:
                date_str = current.isoformat()
                occupied[date_str] = {
                    'date': date_str,
                    'reason': f'Tournoi: {tournament.name}',
                    'type': 'tournament',
                    'full_day': True
                }
                current += timedelta(days=1)

        # 3. Add a fallback for days with reservations that are NOT full day
        # (This is handled by ensuring 'full_day' is only True for tournaments)

        return Response({
            'terrain_id': str(terrain.id),
            'year': year,
            'month': month,
            'occupied_dates': list(occupied.values())
        })

    @action(detail=False, methods=['get'], url_path='platform-stats')
    def platform_stats(self, request):
        """
        Returns general platform statistics for the home page.
        """
        terrains_count = Terrain.objects.filter(is_active=True).count()
        players_count = Tournament.objects.model._meta.apps.get_model('users.User').objects.filter(role='player').count()
        tournaments_count = Tournament.objects.count()

        return Response({
            'terrains_count': terrains_count,
            'players_count': players_count,
            'tournaments_count': tournaments_count
        })
