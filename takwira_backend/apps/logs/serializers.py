from rest_framework import serializers
from apps.logs.models import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = [
            'id', 'user_email', 'method', 'path', 'status_code',
            'level', 'message', 'ip_address', 'duration_ms', 'timestamp',
        ]
