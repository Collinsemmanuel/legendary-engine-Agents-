from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import generics
from .serializers import (
    UserSerializer, AgentSerializer, UserProfileSerializer,
    PurchaseHistorySerializer, SellerAgentSerializer,
    OrderSerializer, OrderCreateSerializer # Import Order serializers
)
from .models import Agent, UserProfile, Transaction, Order # Import Order model

class RegisterView(views.APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'user_id': user.id, 'username': user.username}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(views.APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            login(request, user) # Log in the user to the session
            return Response({'token': token.key, 'user_id': user.id, 'username': user.username}, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Delete the token to logout
            request.user.auth_token.delete()
            logout(request) # Log out the user from the session
            return Response({'message': 'Successfully logged out.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AgentUploadView(views.APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        serializer = AgentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            # The serializer's create method now needs to handle uploaded_by
            # or we set it here before saving.
            # Let's assume serializer.save() can take additional arguments
            # or the serializer is modified to get user from context.
            # For clarity, let's explicitly pass 'uploaded_by'.
            serializer.save(uploaded_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AgentListView(generics.ListAPIView):
    queryset = Agent.objects.all().order_by('-created_at') # Show newest first
    serializer_class = AgentSerializer
    # Permission can be IsAuthenticatedOrReadOnly if we want to allow browsing for all
    # For now, keeping it public as per requirements.
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class AgentDetailView(generics.RetrieveAPIView):
    queryset = Agent.objects.all()
    serializer_class = AgentSerializer
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # UserProfile is guaranteed to exist due to the post_save signal on User creation.
        # If it might not (e.g. for users created before signal was in place),
        # get_or_create is safer.
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

class BuyerDashboardSummaryView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        # Calculate total_purchased_agents: Count of distinct agents in Transaction records
        total_purchased_agents = Transaction.objects.filter(buyer=user).aggregate(
            distinct_agents=Count('agent', distinct=True)
        )['distinct_agents'] or 0

        # Calculate total_spent: Sum of amount in Transaction records
        total_spent_data = Transaction.objects.filter(buyer=user).aggregate(total_spent=Sum('amount'))
        total_spent = total_spent_data['total_spent'] or 0.00

        # active_deployments: Placeholder - can be total_purchased_agents or 0 for now
        active_deployments = total_purchased_agents # Or 0, or more complex logic later

        summary_data = {
            'total_purchased_agents': total_purchased_agents,
            'total_spent': float(total_spent), # Ensure it's float for JSON
            'active_deployments': active_deployments,
        }
        return Response(summary_data, status=status.HTTP_200_OK)

class OrderCreateView(generics.CreateAPIView):
    serializer_class = OrderCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        agent_id = serializer.validated_data['agent_id']
        agent = Agent.objects.get(pk=agent_id) # Agent existence already validated by serializer
        user = self.request.user

        # Prevent buying own agent - this check is more robust in the view
        if agent.uploaded_by == user:
            # Using serializers.ValidationError directly here is not standard for perform_create.
            # This kind of check is better in the main 'create' method or serializer's 'validate'
            # For now, let's raise it and see how DRF handles it, or adjust create method.
            # A better way is to move this to the create method before calling super().create or self.perform_create
            # For now, this will likely result in a 500 if not handled by DRF's default exception handling in CreateAPIView
            # Let's adjust this in the `create` method override.
            # This specific perform_create will be called by self.create(), so we'll rely on that.
            pass # Validation moved to create method

        # Create the order
        order = Order.objects.create(
            buyer=user,
            agent=agent,
            price_at_purchase=agent.price
        )
        return order # Return the created order instance

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data) # self.get_serializer_context() is auto-added

        try:
            serializer.is_valid(raise_exception=True)
            agent_id = serializer.validated_data['agent_id']
            agent = Agent.objects.get(pk=agent_id) # Already validated, but get instance
            user = self.request.user

            # Prevent buying own agent
            if agent.uploaded_by == user:
                return Response({"detail": "You cannot purchase your own agent."}, status=status.HTTP_400_BAD_REQUEST)

            # Check if user already has a completed order for this agent (idempotency for one-time purchases)
            # This assumes a Transaction record is created only after successful payment.
            # If Order itself tracks final purchase, check Order.status == 'completed'
            if Order.objects.filter(buyer=user, agent=agent, status='completed').exists():
               return Response({"detail": "You have already successfully purchased this agent."}, status=status.HTTP_400_BAD_REQUEST)

            # Check for existing 'pending_payment' order for this agent by this user, if so, maybe return that one
            existing_pending_order = Order.objects.filter(buyer=user, agent=agent, status='pending_payment').first()
            if existing_pending_order:
                response_serializer = OrderSerializer(existing_pending_order, context={'request': request})
                return Response(response_serializer.data, status=status.HTTP_200_OK) # Return existing pending order

            # If all checks pass, proceed to create the order object via perform_create
            order_instance = self.perform_create(serializer)

            # Serialize the created order_instance using OrderSerializer for the response
            response_serializer = OrderSerializer(order_instance, context={'request': request})
            headers = self.get_success_headers(response_serializer.data)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

        except serializers.ValidationError as e:
            # This will catch validation errors from OrderCreateSerializer
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        # Other exceptions (like Agent.DoesNotExist if serializer didn't catch it) would result in 500

class SellerAgentsListView(generics.ListAPIView):
    serializer_class = SellerAgentSerializer
    permission_classes = [IsAuthenticated]
    # Pagination is handled by global settings

    def get_queryset(self):
        # Filter agents to only those uploaded by the current authenticated user
        return Agent.objects.filter(uploaded_by=self.request.user).order_by('-created_at')

class BuyerPurchasesListView(generics.ListAPIView):
    serializer_class = PurchaseHistorySerializer
    permission_classes = [IsAuthenticated]
    # Pagination is handled by global settings in settings.py

    def get_queryset(self):
        # Filter transactions to only those made by the current authenticated user
        return Transaction.objects.filter(buyer=self.request.user).order_by('-timestamp')

PLATFORM_FEE_PERCENTAGE = 0.20 # 20% platform fee

class SellerDashboardSummaryView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        # Count of agents uploaded by the user
        listed_agents_count = Agent.objects.filter(uploaded_by=user).count()

        # Total number of sales of the user's agents
        # This counts each transaction record where the agent was uploaded by the user.
        # If an agent can be bought multiple times in different transactions, this counts all such sales.
        total_agents_sold_count = Transaction.objects.filter(agent__uploaded_by=user).count()

        # Calculate total earnings after platform fee
        total_revenue = Transaction.objects.filter(agent__uploaded_by=user).aggregate(
            total=Sum('amount')
        )['total'] or 0.00

        total_earnings = float(total_revenue) * (1 - PLATFORM_FEE_PERCENTAGE)

        # Average rating: Placeholder for now as there's no rating model
        average_rating = "N/A" # Or 0.0, or fetch if implemented

        summary_data = {
            'listed_agents_count': listed_agents_count,
            'total_agents_sold_count': total_agents_sold_count,
            'total_earnings': round(total_earnings, 2),
            'average_rating': average_rating,
        }
        return Response(summary_data, status=status.HTTP_200_OK)
