from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/call_status/(?P<session_id>\w+)/$', consumers.CallStatusConsumer.as_asgi()),
]
