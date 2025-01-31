from django.shortcuts import render

from django.http import JsonResponse
from server.yh.auth_decorators import admin_required, business_owner_required, agent_required, customer_required

@admin_required
def admin_dashboard(request):
    return JsonResponse({"message": "Welcome, Admin!"})

@business_owner_required
def business_owner_dashboard(request):
    return JsonResponse({"message": "Welcome, Business Owner!"})

@agent_required
def agent_dashboard(request):
    return JsonResponse({"message": "Welcome, Agent!"})

@customer_required
def customer_dashboard(request):
    return JsonResponse({"message": "Welcome, Customer!"})