import uuid
from django.db import models
from django.conf import settings


class ActivityLog(models.Model):
    """Logs all meaningful API activity for admin monitoring."""

    LEVEL_CHOICES = (
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('error', 'Error'),
        ('success', 'Success'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activity_logs',
    )
    user_email = models.CharField(max_length=255, blank=True, default='')
    method = models.CharField(max_length=10)  # GET, POST, PUT, PATCH, DELETE
    path = models.CharField(max_length=500)
    status_code = models.IntegerField(null=True, blank=True)
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES, default='info')
    message = models.TextField(blank=True, default='')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, default='')
    duration_ms = models.IntegerField(null=True, blank=True)  # request duration in ms
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Activity Log'
        verbose_name_plural = 'Activity Logs'

    def __str__(self):
        return f"[{self.level.upper()}] {self.method} {self.path} - {self.status_code} ({self.user_email})"
