from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Avg, Q
from datetime import timedelta
from django.utils.timezone import now
from django.contrib.auth.models import User
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
    
class CustomerDashboard(APIView):
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

        # Total Customers
        total_customers = User.objects.count()

        # Active Customers (customers who made a purchase in the last `time_period` days)
        active_customers = User.objects.filter(
            sales__timestamp__gte=start_date
        ).distinct().count()

        # New Customers (customers who joined in the last `time_period` days)
        new_customers = User.objects.filter(
            date_joined__gte=start_date
        ).count()

        # Retention Rate (percentage of customers who made more than one purchase)
        repeat_customers = User.objects.annotate(
            purchase_count=Count('sales')
        ).filter(purchase_count__gt=1).count()

        retention_rate = (repeat_customers / total_customers * 100) if total_customers > 0 else 0

        # Churn Rate (percentage of customers who haven't made a purchase in the last 90 days)
        churned_customers = User.objects.filter(
            sales__timestamp__lte=now() - timedelta(days=90)
        ).distinct().count()

        churn_rate = (churned_customers / total_customers * 100) if total_customers > 0 else 0

        # Customer Lifetime Value (CLV)
        total_clv = Sale.objects.aggregate(total_clv=Sum('total_price'))['total_clv'] or 0
        average_clv = total_clv / total_customers if total_customers > 0 else 0

        top_clv_customers = User.objects.annotate(
            total_spent=Sum('sales__total_price')
        ).order_by('-total_spent').values('username', 'total_spent')[:5]

        # Segmentation by Spending
        high_spenders = User.objects.annotate(
            total_spent=Sum('sales__total_price')
        ).filter(total_spent__gte=1000).count()

        moderate_spenders = User.objects.annotate(
            total_spent=Sum('sales__total_price')
        ).filter(total_spent__range=(500, 999)).count()

        low_spenders = User.objects.annotate(
            total_spent=Sum('sales__total_price')
        ).filter(total_spent__lt=500).count()

        # Segmentation by Activity
        active_users = User.objects.filter(
            sales__timestamp__gte=now() - timedelta(days=30)
        ).distinct().count()

        inactive_users = User.objects.exclude(
            sales__timestamp__gte=now() - timedelta(days=30)
        ).count()

        at_risk_users = User.objects.filter(
            sales__timestamp__gte=now() - timedelta(days=90),
            sales__timestamp__lte=now() - timedelta(days=30)
        ).distinct().count()

        # Purchase Behavior
        repeat_purchase_rate = User.objects.annotate(
            purchase_count=Count('sales')
        ).filter(purchase_count__gt=1).count() / total_customers * 100 if total_customers > 0 else 0

        purchase_frequency = Sale.objects.aggregate(avg_purchases=Avg('customer__sales__quantity'))['avg_purchases'] or 0

        # Activity Timeline
        activity_timeline = Sale.objects.filter(
            timestamp__gte=start_date
        ).values('timestamp__date').annotate(total_sales=Count('id')).order_by('timestamp__date')

        return Response({
            "total_customers": total_customers,
            "active_customers": active_customers,
            "new_customers": new_customers,
            "retention_rate": retention_rate,
            "churn_rate": churn_rate,
            "average_clv": average_clv,
            "top_clv_customers": top_clv_customers,
            "high_spenders": high_spenders,
            "moderate_spenders": moderate_spenders,
            "low_spenders": low_spenders,
            "active_users": active_users,
            "inactive_users": inactive_users,
            "at_risk_users": at_risk_users,
            "repeat_purchase_rate": repeat_purchase_rate,
            "purchase_frequency": purchase_frequency,
            "activity_timeline": list(activity_timeline),
        }, status=200)