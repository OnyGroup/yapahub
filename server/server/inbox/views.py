from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Message, Ticket

@login_required
def inbox(request):
    # Fetch messages for the logged-in user
    messages = Message.objects.filter(recipient=request.user).order_by('-timestamp')
    return render(request, 'inbox/inbox.html', {'messages': messages})

@login_required
def send_message(request):
    if request.method == 'POST':
        recipient_id = request.POST.get('recipient')
        subject = request.POST.get('subject')
        body = request.POST.get('body')
        recipient = get_object_or_404(User, id=recipient_id)
        Message.objects.create(sender=request.user, recipient=recipient, subject=subject, body=body)
        return redirect('inbox')
    return render(request, 'inbox/send_message.html')

@login_required
def view_ticket(request, ticket_id):
    ticket = get_object_or_404(Ticket, id=ticket_id)
    return render(request, 'inbox/view_ticket.html', {'ticket': ticket})

@login_required
def create_ticket(request):
    if request.method == 'POST':
        subject = request.POST.get('subject')
        description = request.POST.get('description')
        Ticket.objects.create(customer=request.user, subject=subject, description=description)
        return redirect('inbox')
    return render(request, 'inbox/create_ticket.html')