from rest_framework import generics, filters
from rest_framework.response import Response
from apps.logs.models import ActivityLog
from apps.logs.serializers import ActivityLogSerializer
from apps.users.permissions import IsAdminUser


class ActivityLogListView(generics.ListAPIView):
    """List all activity logs — admin only. Supports filtering by level/method."""
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAdminUser]
    # No OrderingFilter — ordering is fixed to -timestamp to avoid slice conflict
    filter_backends = [filters.SearchFilter]
    search_fields = ['user_email', 'message', 'path', 'method']

    def get_queryset(self):
        qs = ActivityLog.objects.order_by('-timestamp')

        # Filter by level
        level = self.request.query_params.get('level')
        if level:
            qs = qs.filter(level=level)

        # Filter by method
        method = self.request.query_params.get('method')
        if method:
            qs = qs.filter(method=method.upper())

        return qs

    def list(self, request, *args, **kwargs):
        # Apply limit AFTER filtering (slicing must happen last)
        try:
            limit = min(int(request.query_params.get('limit', 100)), 500)
        except (ValueError, TypeError):
            limit = 100

        queryset = self.filter_queryset(self.get_queryset())[:limit]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class ClearLogsView(generics.DestroyAPIView):
    """Delete all activity logs — admin only."""
    permission_classes = [IsAdminUser]

    def get_object(self):
        return None

    def perform_destroy(self, instance):
        ActivityLog.objects.all().delete()

    def delete(self, request, *args, **kwargs):
        self.perform_destroy(None)
        from rest_framework.response import Response
        return Response({'message': 'Tous les logs ont été supprimés.'}, status=200)
