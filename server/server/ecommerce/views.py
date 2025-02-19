from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from .utils.cloudinary_utils import upload_image_to_cloudinary
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
    parser_classes = [MultiPartParser, FormParser]  # Enable file uploads

    @action(detail=False, methods=["get"], url_path="low-stock")
    def low_stock_products(self, request):
        """Return products with stock less than or equal to 10."""
        low_stock_products = Product.objects.filter(stock__lte=10)
        serializer = self.get_serializer(low_stock_products, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """
        Handle product creation with image uploads.
        Expects 'images' as a list of files in the request.
        """
        # Extract images from the request
        images = request.FILES.getlist('images')  # Get list of uploaded images
        serializer = self.get_serializer(data=request.data, context={'images': images})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        """
        Handle product updates with optional image uploads.
        Expects 'images' as a list of files in the request.
        """
        instance = self.get_object()
        images = request.FILES.getlist('images')  # Get list of uploaded images
        serializer = self.get_serializer(instance, data=request.data, partial=True, context={'images': images})
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def perform_create(self, serializer):
        """
        Save the product and upload images to Cloudinary.
        """
        images = serializer.context.get('images', [])
        product = serializer.save()

        # Upload each image to Cloudinary and save the URLs
        for image_file in images:
            image_url = upload_image_to_cloudinary(image_file)
            if image_url:
                product.images.create(image_url=image_url)  # Create ProductImage objects

    def perform_update(self, serializer):
        """
        Update the product and optionally add new images.
        """
        images = serializer.context.get('images', [])
        product = serializer.save()

        # Upload new images to Cloudinary and save the URLs
        for image_file in images:
            image_url = upload_image_to_cloudinary(image_file)
            if image_url:
                product.images.create(image_url=image_url)  # Create ProductImage objects

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