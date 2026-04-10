from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Tournament, Team, TournamentRequest, JoinRequest
from .serializers import (
    TournamentSerializer, TournamentDetailSerializer, TeamSerializer,
    TournamentRequestSerializer, JoinRequestSerializer
)
from apps.users.permissions import IsAdminUser
from apps.utils.availability import check_tournament_availability

class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all().order_by('-created_at')

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
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

class TournamentRequestViewSet(viewsets.ModelViewSet):
    serializer_class = TournamentRequestSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return TournamentRequest.objects.all().order_by('-created_at')
        return TournamentRequest.objects.filter(creator=user).order_by('-created_at')

    def get_permissions(self):
        if self.action in ['approve', 'reject']:
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
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
            return [IsAdminUser()]
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
