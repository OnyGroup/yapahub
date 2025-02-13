from django.urls import path
from . import views

urlpatterns = [
    # Campaign Management
    path('campaigns/', views.CampaignListView.as_view(), name='campaign-list'),
    path('campaigns/<int:campaign_id>/performance/', views.CampaignPerformanceView.as_view(), name='campaign-performance'),

    # Discount Codes
    path('discounts/', views.DiscountCodeListView.as_view(), name='discount-list'),
]