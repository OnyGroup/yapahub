from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from analytics.models import Product, Sale, CustomerActivity
from datetime import timedelta
import random
from django.utils import timezone  # Import timezone utilities

class Command(BaseCommand):
    help = 'Load test analytics data into the database'

    def handle(self, *args, **kwargs):
        # Create users with varying spending capacities
        users = []
        for i in range(1, 201):  # Create 200 users
            username = f"user{i}"
            email = f"user{i}@example.com"
            user, _ = User.objects.get_or_create(username=username, email=email)
            users.append(user)

        # Create products
        products = []
        for i in range(1, 51):  # Create 50 products
            product, _ = Product.objects.get_or_create(
                name=f"Product {i}",
                price=random.uniform(10, 500),  # Prices between $10 and $500
                stock=random.randint(0, 200)    # Stock between 0 and 200
            )
            products.append(product)

        # Create sales data
        for _ in range(1000):  # Generate 1000 sales records
            product = random.choice(products)
            customer = random.choice(users)
            quantity = random.randint(1, 10)  # Quantities between 1 and 10
            total_price = product.price * quantity
            timestamp = timezone.now() - timedelta(days=random.randint(0, 90))  # Use timezone-aware datetime
            Sale.objects.create(
                product=product,
                quantity=quantity,
                total_price=total_price,
                customer=customer,
                timestamp=timestamp
            )

        # Simulate repeat purchases for retention rate
        repeat_customers = random.sample(users, 100)  # Select 100 users for repeat purchases
        for customer in repeat_customers:
            for _ in range(random.randint(1, 5)):  # Each repeat customer makes 1-5 additional purchases
                product = random.choice(products)
                quantity = random.randint(1, 10)
                total_price = product.price * quantity
                timestamp = timezone.now() - timedelta(days=random.randint(0, 90))  # Use timezone-aware datetime
                Sale.objects.create(
                    product=product,
                    quantity=quantity,
                    total_price=total_price,
                    customer=customer,
                    timestamp=timestamp
                )

        # Create customer activity data
        actions = ["Purchase", "Signup", "Refund", "Login", "Product View"]
        for _ in range(2000):  # Generate 2000 activity records
            customer = random.choice(users)
            action = random.choice(actions)
            timestamp = timezone.now() - timedelta(days=random.randint(0, 90))  # Use timezone-aware datetime
            CustomerActivity.objects.create(
                customer=customer,
                action=action,
                timestamp=timestamp
            )

        self.stdout.write(self.style.SUCCESS('Successfully loaded analytics data'))