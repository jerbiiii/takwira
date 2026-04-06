from rest_framework.routers import DefaultRouter
from .views import TerrainViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'', TerrainViewSet, basename='terrain')

urlpatterns = [
    path('', include(router.urls)),
]
