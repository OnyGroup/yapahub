from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .models import CxPipeline, PipelineStage
from .serializers import CxPipelineSerializer, PipelineStageSerializer
from rest_framework.permissions import IsAuthenticated

class PipelineStageListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = PipelineStage.objects.all()
    serializer_class = PipelineStageSerializer

class CxPipelineListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = CxPipeline.objects.all()
    serializer_class = CxPipelineSerializer

class CxPipelineRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = CxPipeline.objects.all()
    serializer_class = CxPipelineSerializer
