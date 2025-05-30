from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import generics
from .serializers import UserSerializer, AgentSerializer
from .models import Agent

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
