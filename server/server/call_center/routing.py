from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/incoming_calls/$', consumers.IncomingCallConsumer.as_asgi()),  # global websocket
    re_path(r'ws/incoming_calls/(?P<session_id>\w+)/$', consumers.IncomingCallConsumer.as_asgi()),  # session-specific websocket
    re_path(r'ws/call_status/(?P<session_id>\w+)/$', consumers.CallStatusConsumer.as_asgi()),
]
