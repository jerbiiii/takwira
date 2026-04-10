from django.urls import path
from apps.logs.views import ActivityLogListView, ClearLogsView

urlpatterns = [
    path('', ActivityLogListView.as_view(), name='logs_list'),
    path('clear/', ClearLogsView.as_view(), name='logs_clear'),
]
