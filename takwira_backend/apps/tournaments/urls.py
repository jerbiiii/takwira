from rest_framework.routers import DefaultRouter
from .views import TournamentViewSet, TournamentRequestViewSet, JoinRequestViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'tournament-requests', TournamentRequestViewSet, basename='tournament-request')
router.register(r'join-requests', JoinRequestViewSet, basename='join-request')
router.register(r'', TournamentViewSet, basename='tournament')

urlpatterns = [
    path('', include(router.urls)),
]
