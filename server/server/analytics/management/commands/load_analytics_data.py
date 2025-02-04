from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from analytics.models import Product, Sale, CustomerActivity
from datetime import datetime, timedelta
import random

class Command(BaseCommand):
    help = 'Load test analytics data into the database'

    def handle(self, *args, **kwargs):
        # Create some users
        users = []
        for i in range(1, 6):  # Create 5 test users
            user, _ = User.objects.get_or_create(username=f"user{i}", email=f"user{i}@example.com")
            users.append(user)

        # Create some products
        products = []
        for i in range(1, 11):  # Create 10 test products
            product, _ = Product.objects.get_or_create(
                name=f"Product {i}",
                price=random.uniform(10, 100),
                stock=random.randint(0, 100)
            )
            products.append(product)

        # Create sales data
        for _ in range(100):  # Generate 100 sales records
            product = random.choice(products)
            customer = random.choice(users)
            quantity = random.randint(1, 5)
            total_price = product.price * quantity
            timestamp = datetime.now() - timedelta(days=random.randint(0, 30))  # Random date in the last 30 days

            Sale.objects.create(
                product=product,
                quantity=quantity,
                total_price=total_price,
                customer=customer,
                timestamp=timestamp
            )

        # Create customer activity data
        actions = ["Purchase", "Signup", "Refund"]
        for _ in range(200):  # Generate 200 activity records
            customer = random.choice(users)
            action = random.choice(actions)
            timestamp = datetime.now() - timedelta(days=random.randint(0, 30))

            CustomerActivity.objects.create(
                customer=customer,
                action=action,
                timestamp=timestamp
            )

        self.stdout.write(self.style.SUCCESS('Successfully loaded analytics data'))