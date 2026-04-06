from rest_framework.routers import DefaultRouter
from .views import TournamentViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'', TournamentViewSet, basename='tournament')

urlpatterns = [
    path('', include(router.urls)),
]
