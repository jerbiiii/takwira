from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Tournament, Team, TournamentRequest, JoinRequest, Match
from .serializers import (
    TournamentSerializer, TournamentDetailSerializer, TeamSerializer,
    TournamentRequestSerializer, JoinRequestSerializer, MatchSerializer
)

class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all().order_by('-created_at')

    def get_queryset(self):
        qs = Tournament.objects.all().order_by('-created_at')
        # Auto-update statuses based on dates
        for t in qs:
            new_status = t.auto_status
            if t.status != new_status:
                Tournament.objects.filter(pk=t.pk).update(status=new_status)

        # For public (non-admin) users, exclude archived tournaments
        include_finished = self.request.query_params.get('include_finished', 'false')
        if include_finished.lower() != 'true':
            # Keep active + finished but not archived
            active_ids = [t.id for t in qs if not t.is_archived]
            qs = qs.filter(id__in=active_ids)
        return qs

    @action(detail=False, methods=['get'])
    def archived(self, request):
        """Returns only archived tournaments for the admin dashboard."""
        qs = Tournament.objects.all()
        # Auto-update statuses
        for t in qs:
            new_status = t.auto_status
            if t.status != new_status:
                Tournament.objects.filter(pk=t.pk).update(status=new_status)
        
        archived_ids = [t.id for t in qs if t.is_archived]
        archived = Tournament.objects.filter(id__in=archived_ids).order_by('-end_date')
        serializer = TournamentDetailSerializer(archived, many=True)
        return Response(serializer.data)

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticatedOrReadOnly()]

    def get_serializer_class(self):
        if self.action in ['retrieve', 'list']:
            return TournamentDetailSerializer
        return TournamentSerializer

    def perform_create(self, serializer):
        terrain = serializer.validated_data['terrain']
        start_date = serializer.validated_data['start_date']
        end_date = serializer.validated_data['end_date']
        
        # Check availability
        is_available, message = check_tournament_availability(terrain, start_date, end_date)
        if not is_available:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"detail": message})

        serializer.save(organizer=self.request.user)

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        tournament = self.get_object()
        
        if tournament.auto_status != 'open':
            return Response({'detail': 'Le tournoi n\'est pas ouvert aux inscriptions.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if tournament.teams.count() >= tournament.max_teams:
            return Response({'detail': 'Le tournoi est complet.'}, status=status.HTTP_400_BAD_REQUEST)

        team_name = request.data.get('team_name')
        if not team_name:
            return Response({'detail': 'Le nom de l\'équipe est requis.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if user already has a team in this tournament
        if tournament.teams.filter(captain=request.user).exists():
            return Response({'detail': 'Vous avez déjà inscrit une équipe dans ce tournoi.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create the team and join
        team = Team.objects.create(name=team_name, captain=request.user)
        tournament.teams.add(team)
        
        return Response({'status': 'Inscription réussie !'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def standings(self, request, pk=None):
        tournament = self.get_object()
        matches = tournament.matches.filter(status='finished')
        
        standings = {}
        for team in tournament.teams.all():
            standings[team.id] = {
                'id': team.id,
                'name': team.name,
                'played': 0,
                'won': 0,
                'drawn': 0,
                'lost': 0,
                'gf': 0,
                'ga': 0,
                'gd': 0,
                'points': 0
            }

        for match in matches:
            if not match.team1 or not match.team2:
                continue
            
            t1_id = match.team1.id
            t2_id = match.team2.id
            s1 = match.score1
            s2 = match.score2

            if t1_id in standings:
                standings[t1_id]['played'] += 1
                standings[t1_id]['gf'] += s1
                standings[t1_id]['ga'] += s2
            
            if t2_id in standings:
                standings[t2_id]['played'] += 1
                standings[t2_id]['gf'] += s2
                standings[t2_id]['ga'] += s1

            if s1 > s2:
                if t1_id in standings:
                    standings[t1_id]['won'] += 1
                    standings[t1_id]['points'] += 3
                if t2_id in standings:
                    standings[t2_id]['lost'] += 1
            elif s1 < s2:
                if t2_id in standings:
                    standings[t2_id]['won'] += 1
                    standings[t2_id]['points'] += 3
                if t1_id in standings:
                    standings[t1_id]['lost'] += 1
            else:
                if t1_id in standings:
                    standings[t1_id]['drawn'] += 1
                    standings[t1_id]['points'] += 1
                if t2_id in standings:
                    standings[t2_id]['drawn'] += 1
                    standings[t2_id]['points'] += 1

        for team_id in standings:
            standings[team_id]['gd'] = standings[team_id]['gf'] - standings[team_id]['ga']

        sorted_standings = sorted(standings.values(), key=lambda x: (x['points'], x['gd'], x['gf']), reverse=True)
        return Response(sorted_standings)

    @action(detail=True, methods=['get'], url_path='group-standings')
    def group_standings(self, request, pk=None):
        """Returns standings broken down by group for the group phase."""
        tournament = self.get_object()
        # Get unique group names from ALL group matches
        all_group_matches = tournament.matches.filter(phase='group')
        group_names = all_group_matches.values_list('group_name', flat=True).distinct()
        
        result = {}
        for group in group_names:
            if group:
                result[group] = tournament.get_group_standings_internal(group)
        
        return Response(result)

    @action(detail=True, methods=['post'], url_path='generate-matches')
    def generate_matches(self, request, pk=None):
        """Generates the group stage matches if tournament is full."""
        tournament = self.get_object()
        if tournament.teams.count() < 2:
            return Response({"error": "Il faut au moins 2 équipes."}, status=status.HTTP_400_BAD_REQUEST)
        
        success = tournament.generate_group_stage()
        if success:
            return Response({"message": "Matchs de poules générés avec succès !"})
        return Response({"error": "Le tournoi a déjà commencé ou les matchs existent déjà."}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='advance-phase')
    def advance_phase(self, request, pk=None):
        """Advances the tournament to the next phase (e.g., from groups to 1/8)."""
        tournament = self.get_object()
        result = tournament.advance_tournament()
        return Response({"message": result})

class MatchViewSet(viewsets.ModelViewSet):
    queryset = Match.objects.all().order_by('match_date', 'order')
    serializer_class = MatchSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()

class TournamentRequestViewSet(viewsets.ModelViewSet):
    serializer_class = TournamentRequestSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return TournamentRequest.objects.all().order_by('-created_at')
        return TournamentRequest.objects.filter(creator=user).order_by('-created_at')

    def get_permissions(self):
        if self.action in ['approve', 'reject']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        user = self.request.user
        if not user.subscription_plan or not user.subscription_plan.can_create_tournament:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({
                "detail": "Votre forfait actuel ne vous permet pas de créer des tournois. Veuillez passer à un forfait Pro ou Club."
            })
        serializer.save(creator=self.request.user)

    @action(detail=True, methods=['post', 'patch'])
    def approve(self, request, pk=None):
        tournament_request = self.get_object()
        if tournament_request.status != 'pending':
            return Response({'detail': 'Cette requête a déjà été traitée.'}, status=status.HTTP_400_BAD_REQUEST)

        admin_notes = request.data.get('admin_notes', '')

        # Create the actual tournament
        from datetime import timedelta
        Tournament.objects.create(
            name=tournament_request.name,
            organizer=tournament_request.creator,
            terrain=tournament_request.terrain,
            start_date=tournament_request.start_date,
            end_date=tournament_request.start_date + timedelta(days=1), # Default to 1 day
            max_teams=tournament_request.max_teams,
            entry_fee=tournament_request.entry_fee,
            status='open'
        )

        tournament_request.status = 'approved'
        tournament_request.admin_notes = admin_notes
        tournament_request.save()
        return Response({'status': 'Requête approuvée et tournoi créé !'})

    @action(detail=True, methods=['post', 'patch'])
    def reject(self, request, pk=None):
        tournament_request = self.get_object()
        admin_notes = request.data.get('admin_notes', '')
        tournament_request.status = 'rejected'
        tournament_request.admin_notes = admin_notes
        tournament_request.save()
        return Response({'status': 'Requête rejetée.'})

class JoinRequestViewSet(viewsets.ModelViewSet):
    serializer_class = JoinRequestSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return JoinRequest.objects.all().order_by('-created_at')
        return JoinRequest.objects.filter(user=user).order_by('-created_at')

    def get_permissions(self):
        if self.action in ['approve', 'reject']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post', 'patch'])
    def approve(self, request, pk=None):
        join_request = self.get_object()
        if join_request.status != 'pending':
            return Response({'detail': 'Cette requête a déjà été traitée.'}, status=status.HTTP_400_BAD_REQUEST)

        tournament = join_request.tournament
        if tournament.teams.count() >= tournament.max_teams:
            return Response({'detail': 'Le tournoi est complet.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create a team for the user (defaulting to "Team [User Email]")
        team_name = f"Team {join_request.user.username}"
        team = Team.objects.create(name=team_name, captain=join_request.user)
        tournament.teams.add(team)

        join_request.status = 'approved'
        join_request.save()
        return Response({'status': 'Inscription approuvée !'})

    @action(detail=True, methods=['post', 'patch'])
    def reject(self, request, pk=None):
        join_request = self.get_object()
        join_request.status = 'rejected'
        join_request.save()
        return Response({'status': 'Requête rejetée.'})
