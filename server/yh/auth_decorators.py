from functools import wraps
from django.http import JsonResponse
from django.core.exceptions import PermissionDenied

def admin_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_superuser:
            raise PermissionDenied("Admins only!")
        return view_func(request, *args, **kwargs)
    return _wrapped_view

def business_owner_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.groups.filter(name="Business Owners").exists():
            raise PermissionDenied("Business Owners only!")
        return view_func(request, *args, **kwargs)
    return _wrapped_view

def agent_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.groups.filter(name="Agents").exists():
            raise PermissionDenied("Agents only!")
        return view_func(request, *args, **kwargs)
    return _wrapped_view

def customer_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.groups.filter(name="Customers").exists():
            raise PermissionDenied("Customers only!")
        return view_func(request, *args, **kwargs)
    return _wrapped_view