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
        user = self.request.user
        plan = user.subscription_plan
        
        # Enforce monthly reservation limit
        if plan:
            from django.utils import timezone
            now = timezone.now()
            # Count reservations by this user in the current month
            month_count = Reservation.objects.filter(
                player=user,
                date__year=now.year,
                date__month=now.month
            ).exclude(status='cancelled').count()
            
            if month_count >= plan.max_reservations:
                from rest_framework.exceptions import ValidationError
                raise ValidationError({
                    "detail": f"Limite de réservations mensuelle atteinte ({plan.max_reservations}). Veuillez augmenter votre forfait pour plus de réservations."
                })

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
            
        # Optional: Prevent canceling past reservations (except for admins)
        from django.utils import timezone
        if reservation.date < timezone.now().date() and request.user.role != 'admin':
            return Response({'detail': 'Impossible d\'annuler une réservation passée.'}, status=status.HTTP_400_BAD_REQUEST)

        reservation.status = 'cancelled'
        reservation.save()
        return Response({'status': 'Réservation annulée'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def owner_stats(self, request):
        """Returns statistics for terrain owners (revenue, bookings)."""
        user = request.user
        if not user.subscription_plan or not user.subscription_plan.can_manage_terrain:
            return Response({'detail': 'Réservé aux propriétaires de terrains.'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get all reservations for terrains owned by this user
        owned_terrains = user.terrains.all()
        reservations = Reservation.objects.filter(terrain__in=owned_terrains, status='confirmed')
        
        total_revenue = sum(r.total_price for r in reservations)
        total_bookings = reservations.count()
        
        # Monthly revenue
        from django.utils import timezone
        now = timezone.now()
        monthly_reservations = reservations.filter(date__year=now.year, date__month=now.month)
        monthly_revenue = sum(r.total_price for r in monthly_reservations)
        
        return Response({
            'total_revenue': total_revenue,
            'total_bookings': total_bookings,
            'monthly_revenue': monthly_revenue,
            'monthly_bookings': monthly_reservations.count(),
        })
