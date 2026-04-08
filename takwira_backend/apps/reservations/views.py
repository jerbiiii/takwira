from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Reservation
from .serializers import ReservationSerializer, ReservationDetailSerializer
from apps.utils.availability import check_terrain_availability
from datetime import datetime, timedelta

class ReservationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Admins see all, players see their own
        if user.role == 'admin':
            return Reservation.objects.all().order_by('-created_at')
        return Reservation.objects.filter(player=user).order_by('-created_at')

    def get_serializer_class(self):
        if self.action in ['retrieve', 'list']:
            return ReservationDetailSerializer
        return ReservationSerializer

    def perform_create(self, serializer):
        terrain = serializer.validated_data['terrain']
        date = serializer.validated_data['date']
        start_time = serializer.validated_data['start_time']
        
        # Default duration is 2 hours
        # Convert start_time (time object) to datetime to add duration
        dummy_date = datetime.combine(datetime.today(), start_time)
        end_time = (dummy_date + timedelta(hours=2)).time()
        
        # Check availability
        is_available, message = check_terrain_availability(terrain, date, start_time, end_time)
        if not is_available:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"detail": message})

        # Calculate total price (2 hours)
        total_price = terrain.price_per_hour * 2
        
        serializer.save(
            player=self.request.user, 
            end_time=end_time,
            total_price=total_price, 
            status='confirmed' # Forcing confirmed for now to simplify
        )

    @action(detail=True, methods=['patch'])
    def cancel(self, request, pk=None):
        reservation = self.get_object()
        if request.user != reservation.player and request.user.role != 'admin':
            return Response({'detail': 'Non autorisé.'}, status=status.HTTP_403_FORBIDDEN)
        reservation.status = 'cancelled'
        reservation.save()
        return Response({'status': 'Réservation annulée'}, status=status.HTTP_200_OK)
