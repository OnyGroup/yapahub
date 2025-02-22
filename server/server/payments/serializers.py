from rest_framework import serializers
from .models import Payment
from ecommerce.models import Cart, Order, OrderItem

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'order', 'amount', 'reference', 'status', 'email', 'created_at']
        read_only_fields = ['reference', 'status', 'created_at']

class PaymentInitializeSerializer(serializers.Serializer):
    email = serializers.EmailField()
    shipping_address = serializers.CharField()

    def create(self, validated_data):
        user = self.context['request'].user
        cart = Cart.objects.get(user=user)
        
        # Create order from cart
        order = Order.objects.create(
            user=user,
            total_price=cart.total_price(),
            shipping_address=validated_data['shipping_address'],
            status='pending'
        )

        # Create order items
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price=cart_item.product.price
            )

        # Create payment
        payment = Payment.objects.create(
            order=order,
            amount=order.total_price,
            email=validated_data['email']
        )

        return payment