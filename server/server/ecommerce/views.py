from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.filters import SearchFilter, OrderingFilter  # for search and ordering
from django_filters.rest_framework import DjangoFilterBackend  # for advanced filtering
from rest_framework.pagination import PageNumberPagination  # for pagination
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

# Custom Pagination Class 
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10  # Number of items per page
    page_size_query_param = 'page_size'  # Allow client to override page size
    max_page_size = 100  # Maximum page size

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]  # Enable file uploads
    filter_backends = [SearchFilter, OrderingFilter, DjangoFilterBackend]  # Added filters
    search_fields = ['name', 'description']  # Fields to search by
    ordering_fields = ['price', 'stock', 'created_at']  # Fields to order by
    ordering = ['id']  # Default ordering
    pagination_class = StandardResultsSetPagination  # Added pagination

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

    @action(detail=False, methods=["post"], url_path="add")
    def add_to_cart(self, request):
        """
        Add a product to the cart.
        Expected payload:
        {
            "product_id": <int>,
            "quantity": <int> (optional, default=1)
        }
        """
        user = request.user
        product_id = request.data.get("product_id")
        quantity = request.data.get("quantity", 1)  # Default to 1 if not provided

        if not product_id:
            return Response({"error": "Product ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        # Get or create the user's cart
        cart, created = Cart.objects.get_or_create(user=user)

        # Check if the product is already in the cart
        cart_item, item_created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not item_created:
            cart_item.quantity += quantity
        else:
            cart_item.quantity = quantity
        cart_item.save()

        # Serialize and return the updated cart
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], url_path="total-price")
    def total_price(self, request, pk=None):
        """Calculate and return the total price of the cart."""
        cart = self.get_object()
        total = cart.total_price()
        return Response({"total_price": total})

    @action(detail=True, methods=["get"], url_path="total-items")
    def total_items(self, request, pk=None):
        """
        Calculate and return the total number of items in the cart.
        """
        cart = self.get_object()
        total_items = sum(item.quantity for item in cart.items.all())
        return Response({"total_items": total_items})

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