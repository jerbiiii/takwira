from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Tournament, Team
from .serializers import TournamentSerializer, TournamentDetailSerializer, TeamSerializer

class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all().order_by('-created_at')
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action in ['retrieve', 'list']:
            return TournamentDetailSerializer
        return TournamentSerializer

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        tournament = self.get_object()
        
        if tournament.status != 'open':
            return Response({'detail': 'Tournament is not open for registration.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if tournament.teams.count() >= tournament.max_teams:
            return Response({'detail': 'Tournament is full.'}, status=status.HTTP_400_BAD_REQUEST)

        team_name = request.data.get('team_name')
        if not team_name:
            return Response({'detail': 'team_name is required.'}, status=status.HTTP_400_BAD_REQUEST)

        team, created = Team.objects.get_or_create(name=team_name, defaults={'captain': request.user})
        tournament.teams.add(team)
        
        return Response({'status': 'Team successfully joined the tournament'}, status=status.HTTP_200_OK)
