from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Message, Ticket
from .serializers import MessageSerializer, TicketSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from django.contrib.auth.models import User

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
        # Automatically set the sender to the authenticated user
        serializer.save(sender=self.request.user)  # Use the user from the JWT token

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

class ConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        """Retrieve all messages between the logged-in user and another user"""
        try:
            other_user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        # Fetch messages where the logged-in user is either the sender or recipient
        messages = Message.objects.filter(
            Q(sender=request.user, recipient=other_user) |
            Q(sender=other_user, recipient=request.user)
        ).order_by('timestamp')  # Oldest messages first

        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data, status=200)
