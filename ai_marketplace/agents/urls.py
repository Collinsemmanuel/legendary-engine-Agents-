from django.urls import path
from .views import (
    RegisterView, LoginView, LogoutView,
    AgentUploadView, AgentListView, AgentDetailView,
    UserProfileView, BuyerDashboardSummaryView, BuyerPurchasesListView,
    SellerDashboardSummaryView, SellerAgentsListView, OrderCreateView # Import OrderCreateView
)

urlpatterns = [
    # Auth views
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),

    # User Profile view
    path('profile/', UserProfileView.as_view(), name='user-profile'),

    # Dashboard views
    path('dashboard/buyer/summary/', BuyerDashboardSummaryView.as_view(), name='buyer-dashboard-summary'),
    path('dashboard/buyer/purchases/', BuyerPurchasesListView.as_view(), name='buyer-purchases-list'),
    path('dashboard/seller/summary/', SellerDashboardSummaryView.as_view(), name='seller-dashboard-summary'),
    path('dashboard/seller/agents/', SellerAgentsListView.as_view(), name='seller-agents-list'),

    # Order views
    path('orders/create/', OrderCreateView.as_view(), name='order-create'),

    # Agent views
    path('agents/upload/', AgentUploadView.as_view(), name='agent-upload'),
    path('agents/', AgentListView.as_view(), name='agent-list'),
    path('agents/<int:pk>/', AgentDetailView.as_view(), name='agent-detail'),
]
