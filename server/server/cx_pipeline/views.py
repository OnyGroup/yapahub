from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, filters
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import CxPipeline, PipelineStage, PipelineActivity
from .serializers import (
    CxPipelineSerializer, 
    PipelineStageSerializer, 
    PipelineActivitySerializer
)


class PipelineStageListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = PipelineStage.objects.all()
    serializer_class = PipelineStageSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['order', 'name', 'created_at']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class PipelineStageRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = PipelineStage.objects.all()
    serializer_class = PipelineStageSerializer
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Check if the stage is in use
        if instance.pipelines.exists():
            return Response(
                {"detail": "Cannot delete a stage that is being used in pipelines."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)


class PipelineActivityListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PipelineActivitySerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['timestamp', 'activity_type']
    
    def get_queryset(self):
        pipeline_id = self.kwargs.get('pipeline_id')
        return PipelineActivity.objects.filter(pipeline_id=pipeline_id)
    
    def perform_create(self, serializer):
        pipeline_id = self.kwargs.get('pipeline_id')
        serializer.save(
            pipeline_id=pipeline_id,
            user=self.request.user
        )


class CxPipelineListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = CxPipeline.objects.all()
    serializer_class = CxPipelineSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context


class CxPipelineRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = CxPipeline.objects.all()
    serializer_class = CxPipelineSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context


class MigratePipelineStagesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, format=None):
        """
        Migrates existing pipelines to use the new PipelineStage model.
        Creates default stages based on STATUS_CHOICES if they don't exist.
        """
        # Check if default stages already exist
        if PipelineStage.objects.filter(is_default=True).exists():
            return Response(
                {"detail": "Migration has already been performed."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create default stages based on STATUS_CHOICES
        stages = []
        for order, (value, name) in enumerate(CxPipeline.STATUS_CHOICES):
            stage = PipelineStage.objects.create(
                name=name,
                order=order,
                is_default=True,
                created_by=request.user
            )
            stages.append(stage)
        
        # Update existing pipelines to use new stages
        for pipeline in CxPipeline.objects.all():
            # Get the stage corresponding to the current status
            stage_index = pipeline.status - 1  # Adjust for 0-based indexing
            if 0 <= stage_index < len(stages):
                pipeline.stage = stages[stage_index]
                pipeline.save()
        
        return Response({
            "detail": f"Successfully created {len(stages)} default stages and migrated existing pipelines."
        })