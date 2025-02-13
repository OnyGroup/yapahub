from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User, Group
from .models import Message, Ticket

class InboxTests(TestCase):
    def setUp(self):
        # Create users
        self.admin = User.objects.create_superuser('admin_user2', 'admin2@example.com', 'adminpass123')
        self.business_owner = User.objects.create_user('business_owner2', 'business2@example.com', 'businesspass123')
        self.agent = User.objects.create_user('agent2', 'agent2@example.com', 'agentpass123')
        self.customer = User.objects.create_user('customer2', 'customer2@example.com', 'customerpass123')

        # Assign users to groups
        self.admins_group = Group.objects.create(name='Admins')
        self.business_owners_group = Group.objects.create(name='Business Owners')
        self.agents_group = Group.objects.create(name='Agents')
        self.customers_group = Group.objects.create(name='Customers')

        self.admin.groups.add(self.admins_group)
        self.business_owner.groups.add(self.business_owners_group)
        self.agent.groups.add(self.agents_group)
        self.customer.groups.add(self.customers_group)

        # Create messages
        self.message_admin_to_business_owner = Message.objects.create(
            sender=self.admin,
            recipient=self.business_owner,
            subject='Welcome',
            body='Welcome to the platform!'
        )
        self.message_business_owner_to_agent = Message.objects.create(
            sender=self.business_owner,
            recipient=self.agent,
            subject='New Ticket',
            body='Please handle this ticket.'
        )
        self.message_agent_to_customer = Message.objects.create(
            sender=self.agent,
            recipient=self.customer,
            subject='Issue Resolved',
            body='Your issue has been resolved.'
        )

        print(Message.objects.all())  # Debugging

        # Create tickets
        self.ticket_customer = Ticket.objects.create(
            customer=self.customer,
            agent=self.agent,
            subject='Login Issue',
            description='I cannot log in.'
        )
        print(Ticket.objects.all())   # Debugging

    def test_inbox_admin(self):
        login_response = self.client.login(username='admin_user2', password='adminpass123')
        print(f"Login response: {login_response}")  # This will help you see the result of login

        self.assertTrue(login_response)  # Ensure login is successful

        # Now use the correct URL
        response = self.client.get(reverse('inbox'))  # This is your inbox URL, no need to change
        print(f"Response URL: {response.url}")  # Print the URL to check if it's redirecting to the wrong place
        self.assertEqual(response.status_code, 200)  # Should be 200, not 302
        self.assertContains(response, 'Welcome')  # Check if the message appears in the inbox

    def test_inbox_business_owner(self):
        self.client.login(username='business_owner2', password='businesspass123')
        response = self.client.get(reverse('inbox'))
        self.assertEqual(response.status_code, 200)
        # Business owner should see messages where they are the recipient
        self.assertContains(response, 'Welcome')

    def test_inbox_agent(self):
        self.client.login(username='agent2', password='agent123')
        response = self.client.get(reverse('inbox'))
        self.assertEqual(response.status_code, 200)
        # Agent should see messages where they are the recipient
        self.assertContains(response, 'New Ticket')

    def test_inbox_customer(self):
        self.client.login(username='customer2', password='customer123')
        response = self.client.get(reverse('inbox'))
        self.assertEqual(response.status_code, 200)
        # Customer should see messages where they are the recipient
        self.assertContains(response, 'Issue Resolved')