from django.urls import path
from .views import (
    CxPipelineListCreateView, 
    CxPipelineRetrieveUpdateDestroyView,
    PipelineStageListCreateView,
    PipelineStageRetrieveUpdateDestroyView,
    PipelineActivityListCreateView,
    StageTransitionListView,
    StageDurationStatsView,
    MigratePipelineStagesView
)

urlpatterns = [
    # Original Pipeline endpoints
    path('pipelines/', CxPipelineListCreateView.as_view(), name='cx-pipelines'),
    path('pipelines/<int:pk>/', CxPipelineRetrieveUpdateDestroyView.as_view(), name='cx-pipeline-detail'),
    
    # Pipeline Stage endpoints
    path('pipeline-stages/', PipelineStageListCreateView.as_view(), name='pipeline-stages'),
    path('pipeline-stages/<int:pk>/', PipelineStageRetrieveUpdateDestroyView.as_view(), name='pipeline-stage-detail'),
    
    # Pipeline Activity endpoints
    path('pipelines/<int:pipeline_id>/activities/', PipelineActivityListCreateView.as_view(), name='pipeline-activities'),
    
    # Stage Transition endpoints for duration tracking
    path('pipelines/<int:pipeline_id>/transitions/', StageTransitionListView.as_view(), name='pipeline-transitions'),
    path('stage-duration-stats/', StageDurationStatsView.as_view(), name='stage-duration-stats'),
    
    # Migration utility
    path('migrate-pipeline-stages/', MigratePipelineStagesView.as_view(), name='migrate-pipeline-stages'),
]