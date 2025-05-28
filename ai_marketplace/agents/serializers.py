import os
from django.conf import settings # Potentially for MAX_FILE_SIZE, ALLOWED_EXTENSIONS
from django.utils.deconstruct import deconstructible
from django.core.exceptions import ValidationError as DjangoValidationError # For model-level if needed
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Agent


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class AgentSerializer(serializers.ModelSerializer):
    agent_file = serializers.FileField(use_url=True, required=True) # File is required for new uploads.
    uploaded_by_username = serializers.ReadOnlyField(source='uploaded_by.username')

    # Define validation constants
    ALLOWED_EXTENSIONS = ['.zip', '.py', '.pkl', '.h5', '.pth', '.safetensors']
    MAX_UPLOAD_SIZE = 50 * 1024 * 1024  # 50 MB

    class Meta:
        model = Agent
        fields = (
            'id', 'name', 'description', 'version', 'price', 
            'agent_file', 'uploaded_by_username', # Use this for displaying uploader
            'created_at', 'updated_at',
            'uploaded_by' # Keep for writing, will be made effectively write-only
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'uploaded_by_username')
        # uploaded_by is used for relating the user on write, but should not be directly set by client.
        # It's set by the view (request.user).
        # To make it write-only in serializer context (not directly settable via API PUT/POST data):
        extra_kwargs = {
            'uploaded_by': {'write_only': True, 'required': False},
            # agent_file is required on create, but not necessarily on update.
            # The view or form should handle this. For serializer, mark as not strictly required
            # if it can be missing in updates. If always required for output, keep as is.
            # agent_file is now required=True at field level.
            # For PATCH updates, you might want partial=True in the view, which relaxes this.
            # If agent_file is not provided in a PATCH, it won't be validated here.
            # If it is provided, it must pass validation.
        }
    
    def validate_agent_file(self, value):
        """
        Validate the uploaded agent file for extension and size.
        'value' is the UploadedFile object.
        """
        # File extension validation
        ext = os.path.splitext(value.name)[1]
        if ext.lower() not in self.ALLOWED_EXTENSIONS:
            raise serializers.ValidationError(
                f"Unsupported file extension '{ext}'. Allowed extensions are: {', '.join(self.ALLOWED_EXTENSIONS)}"
            )

        # File size validation
        if value.size > self.MAX_UPLOAD_SIZE:
            raise serializers.ValidationError(
                f"File size exceeds the maximum limit of {self.MAX_UPLOAD_SIZE // (1024 * 1024)} MB."
            )
        
        return value

    def create(self, validated_data):
        # 'uploaded_by' is set in the AgentUploadView using serializer.save(uploaded_by=request.user)
        # It should not be in validated_data directly from the client for security.
        # If 'uploaded_by' is in validated_data, it might be from a source we don't want.
        # The view should pass it via .save()
        validated_data.pop('uploaded_by', None) # Ensure client can't set this through data
        return Agent.objects.create(**validated_data)

    def to_representation(self, instance):
        """
        Customize the output representation.
        """
        representation = super().to_representation(instance)
        # Remove 'uploaded_by' (ID) from the output if 'uploaded_by_username' (username) is present.
        if 'uploaded_by_username' in representation:
            representation.pop('uploaded_by', None)
        
        # Ensure agent_file URL is correctly resolved if it's not null
        # and if context has request (it should for GET requests)
        if instance.agent_file and hasattr(instance.agent_file, 'url') and 'request' in self.context:
            representation['agent_file'] = self.context['request'].build_absolute_uri(instance.agent_file.url)
        elif instance.agent_file and hasattr(instance.agent_file, 'url'): # Fallback if no request in context (e.g. some management commands)
            representation['agent_file'] = instance.agent_file.url
        elif not instance.agent_file:
            representation['agent_file'] = None # Or some placeholder if preferred
            
        return representation
