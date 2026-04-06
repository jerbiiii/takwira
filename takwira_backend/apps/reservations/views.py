from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Reservation
from .serializers import ReservationSerializer, ReservationDetailSerializer

class ReservationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'owner':
            return Reservation.objects.filter(terrain__owner=user).order_by('-created_at')
        return Reservation.objects.filter(player=user).order_by('-created_at')

    def get_serializer_class(self):
        if self.action in ['retrieve', 'list']:
            return ReservationDetailSerializer
        return ReservationSerializer

    def perform_create(self, serializer):
        terrain = serializer.validated_data['terrain']
        serializer.save(player=self.request.user, total_price=terrain.price_per_hour, status='pending')

    @action(detail=True, methods=['patch'])
    def cancel(self, request, pk=None):
        reservation = self.get_object()
        if request.user != reservation.player and request.user != reservation.terrain.owner:
            return Response({'detail': 'Not allowed'}, status=403)
        reservation.status = 'cancelled'
        reservation.save()
        return Response({'status': 'Reservation cancelled'}, status=200)
