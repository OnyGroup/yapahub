from django.urls import path
from . import views

urlpatterns = [
    path('', views.InboxView.as_view(), name='inbox'),
    path('send_message/', views.SendMessageView.as_view(), name='send_message'),
    path('view_message/<int:pk>/', views.ViewMessageView.as_view(), name='view_message'),
    path('ticket/<int:pk>/', views.TicketView.as_view(), name='view_ticket'),
    path('create_ticket/', views.CreateTicketView.as_view(), name='create_ticket'),
    path('conversation/<str:username>/', views.ConversationView.as_view(), name='conversation'),
]

