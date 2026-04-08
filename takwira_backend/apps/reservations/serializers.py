from rest_framework import serializers
from .models import Reservation

class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = ('id', 'terrain', 'player', 'player_name', 'date', 'start_time', 'end_time', 'status', 'total_price', 'created_at')
        read_only_fields = ('id', 'player', 'end_time', 'status', 'total_price', 'created_at')

class ReservationDetailSerializer(ReservationSerializer):
    terrain_name = serializers.CharField(source='terrain.name', read_only=True)
    account_username = serializers.CharField(source='player.username', read_only=True)

    class Meta(ReservationSerializer.Meta):
        fields = ReservationSerializer.Meta.fields + ('terrain_name', 'account_username')
