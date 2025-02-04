from django.urls import path
from . import views

urlpatterns = [
    path('sales/dashboard/', views.SalesDashboard.as_view(), name='sales_dashboard'),
    path('inventory/dashboard/', views.InventoryDashboard.as_view(), name='inventory_dashboard'),
]