from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum
from .models import (
    Category,
    Product,
    InventoryHistory,
    Cart,
    CartItem,
    Order,
    OrderItem,
    Review,
)
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    InventoryHistorySerializer,
    CartSerializer,
    CartItemSerializer,
    OrderSerializer,
    OrderItemSerializer,
    ReviewSerializer,
)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=False, methods=["get"], url_path="low-stock")
    def low_stock_products(self, request):
        """Return products with stock less than or equal to 10."""
        low_stock_products = Product.objects.filter(stock__lte=10)
        serializer = self.get_serializer(low_stock_products, many=True)
        return Response(serializer.data)

class InventoryHistoryViewSet(viewsets.ModelViewSet):
    queryset = InventoryHistory.objects.all()
    serializer_class = InventoryHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Ensure users can only access their own cart."""
        return Cart.objects.filter(user=self.request.user)

    @action(detail=True, methods=["get"], url_path="total-price")
    def total_price(self, request, pk=None):
        """Calculate and return the total price of the cart."""
        cart = self.get_object()
        total = cart.total_price()
        return Response({"total_price": total})

class CartItemViewSet(viewsets.ModelViewSet):
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Ensure users can only access their own cart items."""
        return CartItem.objects.filter(cart__user=self.request.user)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Ensure users can only access their own orders."""
        return Order.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Automatically set the user when creating an order."""
        serializer.save(user=self.request.user)

class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Ensure users can only access their own order items."""
        return OrderItem.objects.filter(order__user=self.request.user)

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        """Automatically set the user when creating a review."""
        serializer.save(user=self.request.user)