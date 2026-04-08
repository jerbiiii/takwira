from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Tournament, Team
from .serializers import TournamentSerializer, TournamentDetailSerializer, TeamSerializer
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
        
        if tournament.status != 'open':
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
