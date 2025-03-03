from django.urls import path
from .views import PipelineStageListCreateView, CxPipelineListCreateView, CxPipelineRetrieveUpdateDestroyView

urlpatterns = [
    path('stages/', PipelineStageListCreateView.as_view(), name='pipeline-stages'),
    path('pipelines/', CxPipelineListCreateView.as_view(), name='cx-pipelines'),
    path('pipelines/<int:pk>/', CxPipelineRetrieveUpdateDestroyView.as_view(), name='cx-pipeline-detail'),
]
