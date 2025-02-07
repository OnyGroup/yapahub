from django.urls import path
from .views import AnalyticsDashboard, CustomerDashboard

urlpatterns = [
    path('sales/dashboard/', AnalyticsDashboard.as_view(), name='analytics_dashboard'),
    path('customers/dashboard/', CustomerDashboard.as_view(), name='customer_dashboard'),
]