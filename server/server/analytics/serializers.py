from rest_framework import serializers
from .models import Product, Sale, CustomerActivity, User

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'stock']

class SaleSerializer(serializers.ModelSerializer):
    product = ProductSerializer()
    class Meta:
        model = Sale
        fields = ['id', 'product', 'quantity', 'total_price', 'customer', 'timestamp']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class CustomerActivitySerializer(serializers.ModelSerializer):
    customer = UserSerializer()

    class Meta:
        model = CustomerActivity
        fields = ['id', 'customer', 'action', 'timestamp']