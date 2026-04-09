from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        token['subscription_plan_name'] = user.subscription_plan.name if user.subscription_plan else 'free'
        return token

class UserSerializer(serializers.ModelSerializer):
    subscription_plan_name = serializers.CharField(source='subscription_plan.name', read_only=True, default='free')

    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'phone', 'role', 'subscription_plan', 'subscription_plan_name', 'avatar', 'created_at')
        read_only_fields = ('id', 'created_at', 'role', 'subscription_plan', 'subscription_plan_name')

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
