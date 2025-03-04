from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .models import CxPipeline
from .serializers import CxPipelineSerializer
from rest_framework.permissions import IsAuthenticated, BasePermission

class CxPipelineListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = CxPipeline.objects.all()
    serializer_class = CxPipelineSerializer

class CxPipelineRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = CxPipeline.objects.all()
    serializer_class = CxPipelineSerializer
