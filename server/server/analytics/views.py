from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Avg
from datetime import timedelta
from django.utils.timezone import now
from .models import Product, Sale

class AnalyticsDashboard(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get the time period from query parameters (default to 30 days)
        time_period = request.query_params.get("time_period", "30")  # e.g., "7", "30", "90"
        try:
            time_period = int(time_period)
        except ValueError:
            time_period = 30  # Default to 30 days if invalid value is provided

        # Calculate the start date based on the time period
        start_date = now() - timedelta(days=time_period)

        # Sales Metrics
        total_revenue = Sale.objects.filter(timestamp__gte=start_date).aggregate(total=Sum('total_price'))['total'] or 0
        total_goods_sold = Sale.objects.filter(timestamp__gte=start_date).aggregate(total=Sum('quantity'))['total'] or 0
        total_orders = Sale.objects.filter(timestamp__gte=start_date).count()
        average_order_value = total_revenue / total_orders if total_orders > 0 else 0

        top_selling_products = Sale.objects.filter(timestamp__gte=start_date).values('product__name').annotate(
            total_sold=Sum('quantity')
        ).order_by('-total_sold')[:10]

        recent_sales = Sale.objects.filter(
            timestamp__gte=now() - timedelta(days=7)
        ).aggregate(total=Count('id'))['total']

        # Inventory Metrics
        low_stock_products = list(Product.objects.filter(stock__lte=10).values('name', 'stock'))

        total_sales_quantity = Sale.objects.aggregate(total=Sum('quantity'))['total'] or 0
        total_inventory = Product.objects.aggregate(total=Sum('stock'))['total'] or 1
        inventory_turnover_rate = total_sales_quantity / total_inventory

        return Response({
            "total_revenue": total_revenue,
            "total_goods_sold": total_goods_sold,
            "average_order_value": average_order_value,
            "top_selling_products": top_selling_products,
            "recent_sales": recent_sales,
            "low_stock_products": low_stock_products,
            "inventory_turnover_rate": inventory_turnover_rate,
        }, status=200)