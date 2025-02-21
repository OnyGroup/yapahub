from rest_framework import serializers
from .utils.cloudinary_utils import upload_image_to_cloudinary
from .models import (
    Category,
    Product,
    ProductImage,
    InventoryHistory,
    Cart,
    CartItem,
    Order,
    OrderItem,
    Review,
)

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "description"]

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image_url', 'created_at']

class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)  # Nested serializer for images
    category_name = serializers.CharField(source="category.name", read_only=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False) # Ensures price is a number

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "size",
            "color",
            "price",
            "stock",
            "sku",
            "category",
            "category_name",
            "created_at",
            "updated_at",
            "images",
        ]

    def create(self, validated_data):
        # Extract images from the request context
        images = self.context.get('images', [])
        product = Product.objects.create(**validated_data)

        # Upload each image to Cloudinary and save the URLs
        for image_file in images:
            image_url = upload_image_to_cloudinary(image_file)
            if image_url:
                ProductImage.objects.create(product=product, image_url=image_url)

        return product

class InventoryHistorySerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = InventoryHistory
        fields = [
            "id",
            "product",
            "product_name",
            "change_type",
            "quantity_changed",
            "reason",
            "timestamp",
        ]

class CartSerializer(serializers.ModelSerializer):
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ["id", "user", "total_price"]

    def get_total_price(self, obj):
        return obj.total_price()

class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ["id", "cart", "product", "product_name", "quantity", "total_price"]

    def get_total_price(self, obj):
        return obj.total_price()

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            "id",
            "user",
            "total_price",
            "status",
            "shipping_address",
            "created_at",
            "updated_at",
        ]

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "order",
            "product",
            "product_name",
            "quantity",
            "price",
        ]

class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Review
        fields = ["id", "product", "user", "username", "rating", "comment", "created_at"]