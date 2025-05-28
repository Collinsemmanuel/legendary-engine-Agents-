from django.urls import path
from .views import (
    RegisterView, LoginView, LogoutView, 
    AgentUploadView, AgentListView, AgentDetailView
)

urlpatterns = [
    # Auth views
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),

    # Agent views
    path('agents/upload/', AgentUploadView.as_view(), name='agent-upload'),
    path('agents/', AgentListView.as_view(), name='agent-list'),
    path('agents/<int:pk>/', AgentDetailView.as_view(), name='agent-detail'),
]
