from django.urls import path
from . import views

urlpatterns = [
    path('inbox/', views.inbox, name='inbox'),
    path('send_message/', views.send_message, name='send_message'),
    path('ticket/<int:ticket_id>/', views.view_ticket, name='view_ticket'),
    path('create_ticket/', views.create_ticket, name='create_ticket'),
]