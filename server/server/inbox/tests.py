from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User, Group
from .models import Message, Ticket

class InboxTests(TestCase):
    def setUp(self):
        # Create users
        self.admin = User.objects.create_superuser('admin', 'admin@example.com', 'adminpass')
        self.business_owner = User.objects.create_user('business_owner', 'business@example.com', 'businesspass')
        self.agent = User.objects.create_user('agent', 'agent@example.com', 'agentpass')
        self.customer = User.objects.create_user('customer', 'customer@example.com', 'customerpass')

        # Assign users to groups
        self.admins_group = Group.objects.create(name='Admins')
        self.business_owners_group = Group.objects.create(name='Business Owners')
        self.agents_group = Group.objects.create(name='Agents')
        self.customers_group = Group.objects.create(name='Customers')

        self.admin.groups.add(self.admins_group)
        self.business_owner.groups.add(self.business_owners_group)
        self.agent.groups.add(self.agents_group)
        self.customer.groups.add(self.customers_group)

        # Create messages and tickets
        self.message = Message.objects.create(sender=self.admin, recipient=self.business_owner, subject='Welcome', body='Welcome to the platform!')
        self.ticket = Ticket.objects.create(customer=self.customer, agent=self.agent, subject='Login Issue', description='I cannot log in.')

        # Set up client
        self.client = Client()

    def test_inbox_admin(self):
        self.client.login(username='admin', password='adminpass')
        response = self.client.get(reverse('inbox'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Welcome')

    def test_inbox_business_owner(self):
        self.client.login(username='business_owner', password='businesspass')
        response = self.client.get(reverse('inbox'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Welcome')

    def test_inbox_agent(self):
        self.client.login(username='agent', password='agentpass')
        response = self.client.get(reverse('inbox'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Issue Resolved')

    def test_inbox_customer(self):
        self.client.login(username='customer', password='customerpass')
        response = self.client.get(reverse('inbox'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Issue Resolved')