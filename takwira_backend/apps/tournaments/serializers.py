from rest_framework import serializers
from .models import Tournament, Team

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = ('id', 'name', 'organizer', 'terrain', 'start_date', 'end_date', 'max_teams', 'entry_fee', 'status', 'teams', 'created_at')
        read_only_fields = ('id', 'organizer', 'created_at', 'teams')

class TournamentDetailSerializer(TournamentSerializer):
    teams = TeamSerializer(many=True, read_only=True)
    organizer_name = serializers.CharField(source='organizer.username', read_only=True)
    terrain_name = serializers.CharField(source='terrain.name', read_only=True)

    class Meta(TournamentSerializer.Meta):
        fields = TournamentSerializer.Meta.fields + ('organizer_name', 'terrain_name', 'teams')
