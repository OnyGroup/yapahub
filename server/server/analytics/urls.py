from django.urls import path
from .views import AnalyticsDashboard, CustomerDashboard, SegmentUsersView

urlpatterns = [
    path('sales/dashboard/', AnalyticsDashboard.as_view(), name='analytics_dashboard'),
    path('customers/dashboard/', CustomerDashboard.as_view(), name='customer_dashboard'),
    path('customers/segment/<str:segment_name>/', SegmentUsersView.as_view(), name='segment-users'),
]