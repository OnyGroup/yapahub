from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PhoneNumberViewSet, CallLogViewSet, CallbackURLViewSet,
    MakeCallView, CallStatusWebhook, UserCallHistoryView, IVRHandler, CallerIdView
)

router = DefaultRouter()
router.register(r'phone-numbers', PhoneNumberViewSet)
router.register(r'call-logs', CallLogViewSet)
router.register(r'callback-urls', CallbackURLViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('make-call/', MakeCallView.as_view(), name='make-call'),
    path('webhook/call-status/', CallStatusWebhook.as_view(), name='call-status-webhook'),
    path('user/call-history/', UserCallHistoryView.as_view(), name='user-call-history'),
    path('ivr-handler/', IVRHandler.as_view(), name='ivr-handler'),
    path('caller-id/', CallerIdView.as_view(), name='caller-id'),
]
