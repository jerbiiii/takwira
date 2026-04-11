from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from apps.subscriptions.serializers import PlanSerializer
User = get_user_model()

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['user_id'] = str(user.id) # Standardize user_id for frontend
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        token['subscription_plan_name'] = user.subscription_plan.name if user.subscription_plan else 'free'
        
        # Add plan details to token for immediate enforcement
        if user.subscription_plan:
            token['can_create_tournament'] = user.subscription_plan.can_create_tournament
            token['can_manage_terrain'] = user.subscription_plan.can_manage_terrain
            token['max_reservations'] = user.subscription_plan.max_reservations
        else:
            token['can_create_tournament'] = False
            token['can_manage_terrain'] = False
            token['max_reservations'] = 3

        return token

class UserSerializer(serializers.ModelSerializer):
    subscription_plan_name = serializers.CharField(source='subscription_plan.name', read_only=True, default='free')
    monthly_reservation_count = serializers.SerializerMethodField()
    max_reservations = serializers.IntegerField(source='subscription_plan.max_reservations', read_only=True, default=3)
    can_create_tournament = serializers.BooleanField(source='subscription_plan.can_create_tournament', read_only=True, default=False)
    can_manage_terrain = serializers.BooleanField(source='subscription_plan.can_manage_terrain', read_only=True, default=False)

    subscription_plan_details = PlanSerializer(source='subscription_plan', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'phone', 'role', 'subscription_plan', 'subscription_plan_name', 
                 'subscription_plan_details', 'monthly_reservation_count', 'max_reservations', 
                 'can_create_tournament', 'can_manage_terrain', 'avatar', 'created_at')
        read_only_fields = ('id', 'created_at', 'role', 'subscription_plan', 'subscription_plan_name', 
                           'subscription_plan_details', 'monthly_reservation_count', 'max_reservations', 
                           'can_create_tournament', 'can_manage_terrain')

    def get_monthly_reservation_count(self, obj):
        from apps.reservations.models import Reservation
        from django.utils import timezone
        now = timezone.now()
        return Reservation.objects.filter(
            player=obj,
            date__year=now.year,
            date__month=now.month
        ).exclude(status='cancelled').count()

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'password', 'phone', 'role')

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            username=validated_data.get('username'),
            phone=validated_data.get('phone'),
            role=validated_data.get('role', 'player')
        )
        return user
