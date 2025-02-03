from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Message, Ticket
from .serializers import MessageSerializer, TicketSerializer

class InboxView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated
    serializer_class = MessageSerializer

    def get_queryset(self):
        # Return messages for the logged-in user
        return Message.objects.filter(recipient=self.request.user).order_by('-timestamp')

class SendMessageView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer

    def perform_create(self, serializer):
        # Set the sender to the currently authenticated user
        serializer.save(sender=self.request.user)

class ViewMessageView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer
    queryset = Message.objects.all()

class TicketView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TicketSerializer
    queryset = Ticket.objects.all()

class CreateTicketView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TicketSerializer
