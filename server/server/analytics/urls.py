from django.urls import path
from .views import AnalyticsDashboard

urlpatterns = [
    path('sales/dashboard/', AnalyticsDashboard.as_view(), name='analytics_dashboard'),
]