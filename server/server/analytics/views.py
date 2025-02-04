from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Avg
from datetime import timedelta
from django.utils.timezone import now
from .models import Product, Sale, CustomerActivity
from .serializers import ProductSerializer, SaleSerializer, CustomerActivitySerializer

class SalesDashboard(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Total revenue
        total_revenue = Sale.objects.aggregate(total=Sum('total_price'))['total'] or 0

        # Total goods sold
        total_goods_sold = Sale.objects.aggregate(total=Sum('quantity'))['total'] or 0

        # Average order value
        total_orders = Sale.objects.count()
        average_order_value = total_revenue / total_orders if total_orders > 0 else 0

        # Top-selling products
        top_selling_products = Sale.objects.values('product__name').annotate(
            total_sold=Sum('quantity')
        ).order_by('-total_sold')[:5]

        # Recent sales (last 7 days)
        recent_sales = Sale.objects.filter(
            timestamp__gte=now() - timedelta(days=7)
        ).aggregate(total=Count('id'))

        return Response({
            "total_revenue": total_revenue,
            "total_goods_sold": total_goods_sold,
            "average_order_value": average_order_value,
            "top_selling_products": top_selling_products,
            "recent_sales": recent_sales['total'],
        }, status=200)

class InventoryDashboard(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Products running low on stock
        low_stock_products = list(Product.objects.filter(stock__lte=10).values('name', 'stock'))

        # Inventory turnover rate
        total_sales = Sale.objects.aggregate(total=Sum('quantity'))['total'] or 0
        total_inventory = Product.objects.aggregate(total=Sum('stock'))['total'] or 1
        inventory_turnover_rate = total_sales / total_inventory

        return Response({
            "low_stock_products": low_stock_products or [],  # Ensure it's always a list
            "inventory_turnover_rate": inventory_turnover_rate,
        }, status=200)