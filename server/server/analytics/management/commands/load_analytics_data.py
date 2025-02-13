from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from analytics.models import Product, Sale, CustomerActivity
from datetime import timedelta, datetime
import random
from django.utils import timezone

class Command(BaseCommand):
    help = 'Load test analytics data into the database'

    def handle(self, *args, **kwargs):
        # Create users with varying spending capacities
        users = []
        for i in range(1, 301):  # Create 300 users
            username = f"user{i}"
            email = f"user{i}@example.com"
            # Randomly assign users to spending tiers
            spending_tier = random.choice(["high", "moderate", "low"])
            # Simulate users joining up to 6 months ago
            date_joined = timezone.now() - timedelta(days=random.randint(0, 180))
            user, _ = User.objects.get_or_create(
                username=username,
                email=email,
                defaults={"date_joined": date_joined}
            )
            users.append((user, spending_tier))

        # Create products
        products = []
        for i in range(1, 51):  # Create 50 products
            product, _ = Product.objects.get_or_create(
                name=f"Product {i}",
                price=random.uniform(10, 500),  # Prices between $10 and $500
                stock=random.randint(0, 200)    # Stock between 0 and 200
            )
            products.append(product)

        # Create sales data based on spending tiers
        for user, spending_tier in users:
            num_sales = {
                "high": random.randint(10, 20),      # High spenders make 10-20 purchases
                "moderate": random.randint(5, 10),  # Moderate spenders make 5-10 purchases
                "low": random.randint(1, 5),        # Low spenders make 1-5 purchases
            }[spending_tier]

            for _ in range(num_sales):
                product = random.choice(products)
                quantity = {
                    "high": random.randint(5, 10),  # High spenders buy more
                    "moderate": random.randint(3, 7),
                    "low": random.randint(1, 3),
                }[spending_tier]
                total_price = product.price * quantity
                timestamp = timezone.now() - timedelta(days=random.randint(0, 180))  # Use timezone-aware datetime
                Sale.objects.create(
                    product=product,
                    quantity=quantity,
                    total_price=total_price,
                    customer=user,
                    timestamp=timestamp
                )

        # Simulate repeat purchases for retention rate
        repeat_customers = random.sample(users, 100)  # Select 100 users for repeat purchases
        for user, spending_tier in repeat_customers:
            for _ in range(random.randint(1, 5)):  # Each repeat customer makes 1-5 additional purchases
                product = random.choice(products)
                quantity = {
                    "high": random.randint(5, 10),
                    "moderate": random.randint(3, 7),
                    "low": random.randint(1, 3),
                }[spending_tier]
                total_price = product.price * quantity
                timestamp = timezone.now() - timedelta(days=random.randint(0, 180))  # Use timezone-aware datetime
                Sale.objects.create(
                    product=product,
                    quantity=quantity,
                    total_price=total_price,
                    customer=user,
                    timestamp=timestamp
                )

        # Create customer activity data
        actions = ["Purchase", "Signup", "Refund", "Login", "Product View"]
        for _ in range(3000):  # Generate 3000 activity records
            user, _ = random.choice(users)
            action = random.choice(actions)
            timestamp = timezone.now() - timedelta(days=random.randint(0, 180))  # Use timezone-aware datetime
            CustomerActivity.objects.create(
                customer=user,
                action=action,
                timestamp=timestamp
            )

        self.stdout.write(self.style.SUCCESS('Successfully loaded analytics data'))