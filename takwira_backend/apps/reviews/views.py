from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Count
from .models import Review
from .serializers import ReviewSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer

    def get_queryset(self):
        queryset = Review.objects.select_related('user').all()
        terrain_id = self.request.query_params.get('terrain')
        if terrain_id:
            queryset = queryset.filter(terrain_id=terrain_id)
        return queryset

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'summary']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        review = self.get_object()
        # Only the review author or admin can delete
        if review.user != request.user and getattr(request.user, 'role', '') != 'admin':
            return Response(
                {'detail': "Vous ne pouvez supprimer que vos propres avis."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        review = self.get_object()
        if review.user != request.user:
            return Response(
                {'detail': "Vous ne pouvez modifier que vos propres avis."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        review = self.get_object()
        if review.user != request.user:
            return Response(
                {'detail': "Vous ne pouvez modifier que vos propres avis."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().partial_update(request, *args, **kwargs)

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        """
        Returns the average rating + count + distribution for a terrain.
        Query param: terrain=<uuid>
        """
        terrain_id = request.query_params.get('terrain')
        if not terrain_id:
            return Response(
                {'detail': 'Le paramètre terrain est requis.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        reviews = Review.objects.filter(terrain_id=terrain_id)
        stats = reviews.aggregate(
            average=Avg('rating'),
            count=Count('id')
        )

        # Build distribution (how many 5★, 4★, etc.)
        distribution = {}
        for i in range(1, 6):
            distribution[str(i)] = reviews.filter(rating=i).count()

        return Response({
            'terrain_id': terrain_id,
            'average_rating': round(stats['average'], 1) if stats['average'] else 0,
            'reviews_count': stats['count'],
            'distribution': distribution
        })
