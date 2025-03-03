from django.urls import path
from .views import CxPipelineListCreateView, CxPipelineRetrieveUpdateDestroyView

urlpatterns = [
    path('pipelines/', CxPipelineListCreateView.as_view(), name='cx-pipelines'),
    path('pipelines/<int:pk>/', CxPipelineRetrieveUpdateDestroyView.as_view(), name='cx-pipeline-detail'),
]
