from rest_framework import serializers
from .models import Terrain, TerrainImage


class TerrainImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TerrainImage
        fields = ('id', 'image')

class TerrainSerializer(serializers.ModelSerializer):
    images = TerrainImageSerializer(many=True, read_only=True)
    average_rating = serializers.FloatField(read_only=True, default=0)
    reviews_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Terrain
        fields = '__all__'
        read_only_fields = ('id', 'owner', 'created_at')
