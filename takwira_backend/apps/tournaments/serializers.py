from rest_framework import serializers
from .models import Tournament, Team, TournamentRequest, JoinRequest

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'

class TournamentSerializer(serializers.ModelSerializer):
    status = serializers.ReadOnlyField(source='auto_status')

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

class TournamentRequestSerializer(serializers.ModelSerializer):
    creator_name = serializers.CharField(source='creator.username', read_only=True)
    player_name = serializers.CharField(source='creator.username', read_only=True)
    terrain_name = serializers.CharField(source='terrain.name', read_only=True)

    class Meta:
        model = TournamentRequest
        fields = '__all__'
        read_only_fields = ('id', 'creator', 'created_at', 'status')

class JoinRequestSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    player_name = serializers.CharField(source='user.username', read_only=True)
    tournament_name = serializers.CharField(source='tournament.name', read_only=True)

    class Meta:
        model = JoinRequest
        fields = '__all__'
        read_only_fields = ('id', 'user', 'created_at', 'status')
