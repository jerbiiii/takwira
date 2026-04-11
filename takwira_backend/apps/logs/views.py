from rest_framework import generics, filters
from rest_framework.response import Response
from apps.logs.models import ActivityLog
from apps.logs.serializers import ActivityLogSerializer
from apps.users.permissions import IsAdminUser


from rest_framework.pagination import PageNumberPagination

class ActivityLogPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'limit'
    max_page_size = 100

class ActivityLogListView(generics.ListAPIView):
    """List all activity logs — admin only. Supports filtering by level/method."""
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAdminUser]
    pagination_class = ActivityLogPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['user_email', 'message', 'path', 'method']

    def get_queryset(self):
        qs = ActivityLog.objects.order_by('-timestamp')
        return qs


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
