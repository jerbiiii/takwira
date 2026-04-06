from rest_framework import serializers
from .models import Reservation

class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = ('id', 'terrain', 'player', 'date', 'start_time', 'end_time', 'status', 'total_price', 'created_at')
        read_only_fields = ('id', 'player', 'status', 'total_price', 'created_at')

class ReservationDetailSerializer(ReservationSerializer):
    terrain_name = serializers.CharField(source='terrain.name', read_only=True)
    player_name = serializers.CharField(source='player.username', read_only=True)

    class Meta(ReservationSerializer.Meta):
        fields = ReservationSerializer.Meta.fields + ('terrain_name', 'player_name')
