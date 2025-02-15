# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Campaign, CampaignPerformance, DiscountCode
from .serializers import CampaignSerializer, CampaignPerformanceSerializer, DiscountCodeSerializer
from rest_framework import status
from django.conf import settings
from .utils.email_utils import send_email
from datetime import timedelta
from django.utils.timezone import now
from django.db.models import Sum
from django.contrib.auth.models import User
from .tasks import send_campaign_emails

class CampaignListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        campaigns = Campaign.objects.all()
        serializer = CampaignSerializer(campaigns, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CampaignSerializer(data=request.data)
        if serializer.is_valid():
            campaign = serializer.save()

            # Fetch users based on selected segments
            audience_emails = []
            for segment_name in request.data.get("segments", []):
                if segment_name == "high_spenders":
                    users = User.objects.annotate(
                        total_spent=Sum('sales__total_price', distinct=True)
                    ).filter(total_spent__gte=1000, sales__isnull=False)
                elif segment_name == "moderate_spenders":
                    users = User.objects.annotate(
                        total_spent=Sum('sales__total_price', distinct=True)
                    ).filter(total_spent__range=(500, 999), sales__isnull=False)
                elif segment_name == "low_spenders":
                    users = User.objects.annotate(
                        total_spent=Sum('sales__total_price', distinct=True)
                    ).filter(total_spent__lt=500, sales__isnull=False)

                    print(f"Resolved {users.count()} users for segment 'low_spenders'")
                    for user in users:
                        print(user.id, user.total_spent)
                elif segment_name == "active_users":
                    users = User.objects.filter(
                        sales__timestamp__gte=now() - timedelta(days=30)
                    ).distinct()
                elif segment_name == "inactive_users":
                    users = User.objects.exclude(
                        sales__timestamp__gte=now() - timedelta(days=30)
                    ).distinct()
                elif segment_name == "at_risk_users":
                    users = User.objects.filter(
                        sales__timestamp__gte=now() - timedelta(days=90),
                        sales__timestamp__lte=now() - timedelta(days=30)
                    ).distinct()
                else:
                    return Response({"error": f"Invalid segment: {segment_name}"}, status=400)

                audience_emails.extend([user.email.lower() for user in users])

            # Check if there are any audience emails
            if not audience_emails:
                return Response({"error": "No audience found for the selected segments."}, status=400)

            # Add the resolved users to the campaign's audience field
            assigned_users = User.objects.filter(email__in=audience_emails).distinct()
            print("Assigned users:", assigned_users.values_list('id', flat=True))
            campaign.audience.set(assigned_users)

            # Schedule email-sending task using Celery
            try:
                if campaign.scheduled_at > now():
                    delay = (campaign.scheduled_at - now()).total_seconds()
                    send_campaign_emails.apply_async((campaign.id,), countdown=delay)
                else:
                    send_campaign_emails.delay(campaign.id)
            except Exception as e:
                return Response({"error": f"Failed to schedule emails: {str(e)}"}, status=500)

            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class CampaignPerformanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, campaign_id):
        performance = CampaignPerformance.objects.filter(campaign_id=campaign_id).first()
        serializer = CampaignPerformanceSerializer(performance)
        return Response(serializer.data)


class DiscountCodeListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        codes = DiscountCode.objects.all()
        serializer = DiscountCodeSerializer(codes, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = DiscountCodeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)