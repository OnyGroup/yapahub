# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Campaign, CampaignPerformance, DiscountCode
from .serializers import CampaignSerializer, CampaignPerformanceSerializer, DiscountCodeSerializer

class CampaignListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        campaigns = Campaign.objects.all()
        serializer = CampaignSerializer(campaigns, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CampaignSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
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