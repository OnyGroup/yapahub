from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, filters
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, F, ExpressionWrapper, DurationField, Avg
from django.utils import timezone
from django.db.models.functions import Now
from .models import CxPipeline, PipelineStage, PipelineActivity, StageTransition
from .serializers import (
    CxPipelineSerializer, 
    PipelineStageSerializer, 
    PipelineActivitySerializer,
    StageTransitionSerializer
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

class StageTransitionListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = StageTransitionSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['entry_date', 'exit_date']
    
    def get_queryset(self):
        pipeline_id = self.kwargs.get('pipeline_id')
        return StageTransition.objects.filter(pipeline_id=pipeline_id)

class StageDurationStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, format=None):
        """
        Get stats about average duration in each stage
        """
        stats = []
        for stage in PipelineStage.objects.all():
            # Get completed transitions for this stage
            completed_transitions = StageTransition.objects.filter(
                to_stage=stage, 
                exit_date__isnull=False
            )
            
            # Calculate the average duration
            avg_duration = completed_transitions.aggregate(
                avg_days=Avg(ExpressionWrapper(
                    F('exit_date') - F('entry_date'),
                    output_field=DurationField()
                ))
            )['avg_days']
            
            # Get active transitions
            active_transitions = StageTransition.objects.filter(
                to_stage=stage, 
                exit_date__isnull=True
            ).count()
            
            # Get overdue transitions
            overdue_count = 0
            if stage.expected_duration_days:
                overdue_date = timezone.now() - timezone.timedelta(days=stage.expected_duration_days)
                overdue_count = StageTransition.objects.filter(
                    to_stage=stage,
                    exit_date__isnull=True,
                    entry_date__lt=overdue_date
                ).count()
            
            stats.append({
                'stage_id': stage.id,
                'stage_name': stage.name,
                'expected_duration_days': stage.expected_duration_days,
                'avg_duration_days': avg_duration.days if avg_duration else 0,
                'active_count': active_transitions,
                'overdue_count': overdue_count,
            })
        
        return Response(stats)

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
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['client__name', 'stage__order', 'last_updated']
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by overdue status if requested
        overdue = self.request.query_params.get('overdue', None)
        if overdue:
            now = timezone.now()
            queryset = queryset.filter(
                stage__isnull=False,
                stage_start_date__lt=now - timezone.timedelta(days=F('stage__expected_duration_days'))
            )
        
        return queryset

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
                expected_duration_days=(order + 1) * 7,  # Set reasonable default durations
                created_by=request.user
            )
            stages.append(stage)
        
        # Update existing pipelines to use new stages
        for pipeline in CxPipeline.objects.all():
            # Get the stage corresponding to the current status
            stage_index = pipeline.status - 1  # Adjust for 0-based indexing
            if 0 <= stage_index < len(stages):
                pipeline.stage = stages[stage_index]
                # Create initial transition
                StageTransition.objects.create(
                    pipeline=pipeline,
                    from_stage=None,
                    to_stage=stages[stage_index],
                    user=request.user,
                    entry_date=pipeline.last_updated
                )
                pipeline.stage_start_date = pipeline.last_updated
                pipeline.save()
        
        return Response({
            "detail": f"Successfully created {len(stages)} default stages and migrated existing pipelines."
        })