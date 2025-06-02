import os
import zipfile
import io
from django.conf import settings # Potentially for MAX_FILE_SIZE, ALLOWED_EXTENSIONS
from django.utils.deconstruct import deconstructible
from django.core.exceptions import ValidationError as DjangoValidationError # For model-level if needed
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Agent, UserProfile, Transaction, Order # Import Order


class UserSerializer(serializers.ModelSerializer): # This is used for registration
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
    REQUIRED_FILES_IN_ZIP = ['requirements.txt', 'main.py', 'config.json']
    README_FILENAMES = ['readme.md', 'readme.txt', 'readme']


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

        # ZIP content validation
        if ext.lower() == '.zip':
            missing_files = []
            found_readme = False

            # Ensure the file pointer is at the beginning before reading for zipfile
            value.seek(0)
            try:
                with zipfile.ZipFile(io.BytesIO(value.read()), 'r') as zip_f:
                    zip_content_list = [name.lower() for name in zip_f.namelist()] # Lowercase for case-insensitive checks

                    # Check for required files (case-sensitive for these specific files)
                    original_case_zip_content_list = zip_f.namelist()
                    for required_file in self.REQUIRED_FILES_IN_ZIP:
                        if required_file not in original_case_zip_content_list:
                            missing_files.append(required_file)

                    # Check for README (case-insensitive)
                    for readme_name in self.README_FILENAMES:
                        if readme_name.lower() in zip_content_list:
                            found_readme = True
                            break
                    if not found_readme:
                        missing_files.append(f"README ({', '.join(self.README_FILENAMES)})")

            except zipfile.BadZipFile:
                raise serializers.ValidationError("Invalid ZIP file. The file may be corrupted or not a valid ZIP archive.")
            finally:
                # Reset file pointer so it can be read again by Django's storage system
                value.seek(0)

            if missing_files:
                raise serializers.ValidationError(
                    f"Missing required files in ZIP: {', '.join(missing_files)}."
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
            representation['agent_file'] = None

        return representation

# Serializer for UserProfile model (for updating profile)
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['address_line1', 'city', 'zip_code', 'profile_picture_url']

# Serializer for User model to include profile details (for reading user info)
class UserDetailsSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile', 'first_name', 'last_name']
        # Including first_name and last_name from the User model itself

class PurchaseHistorySerializer(serializers.ModelSerializer):
    agent = AgentSerializer(read_only=True)
    status = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = ['id', 'agent', 'timestamp', 'amount', 'status']

    def get_status(self, obj):
        # Placeholder: In a real app, status might depend on subscription validity, etc.
        return "Active"

class SellerAgentSerializer(AgentSerializer): # Inherit from AgentSerializer
    sales_count = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField() # Placeholder for agent status (e.g., Active, Under Review)

    class Meta(AgentSerializer.Meta): # Inherit Meta from parent
        # Add new fields to the list from parent
        fields = AgentSerializer.Meta.fields + ('sales_count', 'status')
        # Alternatively, define all fields explicitly if more control is needed:
        # fields = [
        #     'id', 'name', 'description', 'version', 'price', 'agent_file',
        #     'uploaded_by_username', 'created_at', 'updated_at',
        #     'sales_count', 'status'
        # ]
        # read_only_fields = AgentSerializer.Meta.read_only_fields + ('sales_count', 'status')


    def get_sales_count(self, obj):
        # obj is an Agent instance
        return Transaction.objects.filter(agent=obj).count()

    def get_status(self, obj):
        # Placeholder: In a real app, this would come from a field on the Agent model
        # e.g., obj.moderation_status or obj.is_active
        # For now, cycling through a few statuses for mock data variety if needed, or just "Active"
        # For real data, this should reflect the actual agent status.
        # Let's assume a default "Active" unless a status field is added to Agent model.
        if hasattr(obj, 'current_status_for_seller_dashboard'): # Example if we had a way to set this
            return obj.current_status_for_seller_dashboard
        return "Active" # Default placeholder


# Serializer for Order model (for reading order data)
class OrderSerializer(serializers.ModelSerializer):
    agent = AgentSerializer(read_only=True)
    buyer_username = serializers.CharField(source='buyer.username', read_only=True)

    class Meta:
        model = Order
        fields = ['order_id', 'buyer_username', 'agent', 'price_at_purchase', 'status', 'created_at']

# Serializer for creating an order (input validation)
class OrderCreateSerializer(serializers.Serializer):
    agent_id = serializers.IntegerField()

    def validate_agent_id(self, value):
        try:
            agent = Agent.objects.get(pk=value)
            if not agent.price: # Or however you determine if an agent is purchasable (e.g. an is_active flag)
                raise serializers.ValidationError("This agent is not currently available for purchase or has no price.")
            # Access context to get the request object, then the user
            # This check is better placed in the view or a more complex validate method if needed
            # user = self.context['request'].user
            # if agent.uploaded_by == user:
            #     raise serializers.ValidationError("You cannot purchase your own agent.")
        except Agent.DoesNotExist:
            raise serializers.ValidationError("Agent not found.")
        return value
