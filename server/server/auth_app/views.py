from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import Group, User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import JSONParser
from .models import UserProfile, CxClient
from .serializers import CxClientSerializer

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        email = request.data.get("email")
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")
        access_level = request.data.get("access_level")  # This field specifies the user's role
        phone_number = request.data.get("phone_number", None) 

        # Check if phone_number is empty or None
        if not phone_number:
            print("Phone number is empty or None")

        if not username or not password or not email or not access_level or not first_name or not last_name:
            return Response({"error": "All fields except phone number are required"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)

        # if phone_number and UserProfile.objects.filter(phone_number=phone_number).exists():
        #     return Response({"error": "Phone number already registered"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            first_name=first_name,
            last_name=last_name 
        )

        # Assigning the user to the appropriate group based on access_level
        try: 
            if access_level == "admin":
                group = Group.objects.get(name="Admins")
                user.is_staff = True
                user.is_superuser = True
            elif access_level == "business_owner":
                group = Group.objects.get(name="Business Owners")
            elif access_level == "agent":
                group = Group.objects.get(name="Agents")
            elif access_level == "customer":
                group = Group.objects.get(name="Customers")
            elif access_level == "account_manager":
                group = Group.objects.get(name="Account Managers")
            else:
                return Response({"error": "Invalid access level"}, status=status.HTTP_400_BAD_REQUEST)

            user.groups.add(group)
        except Group.DoesNotExist:
            return Response({"error": "Role does not exist, please run migrations"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


        # Ensure UserProfile is created before assigning phone_number
        profile, created = UserProfile.objects.get_or_create(user=user)
        profile.phone_number = phone_number
        profile.save()
        user.save()

        return Response({"message": f"{access_level.capitalize()} registered successfully"}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)
        if user is None:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        # Get the user's groups (roles)
        groups = [group.name for group in user.groups.all()]

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Respond with the tokens and the user's groups (roles)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "roles": groups  
        }, status=status.HTTP_200_OK)


class VerifyTokenView(APIView):
    def get(self, request):
        return Response({"message": "Token is valid"}, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh_token")
            if not refresh_token:
                return Response({"error": "Refresh token required"}, status=400)

            token = RefreshToken(refresh_token)
            token.blacklist()  # Blacklist the token

            return Response({"message": "Logout successful"}, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=400)

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        phone_number = user.profile.phone_number if hasattr(user, 'profile') else None
        return Response({
            "username": user.username,
            "email": user.email,
            "phone_number": phone_number
        }, status=status.HTTP_200_OK)

class CxClientListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = CxClient.objects.all()
    serializer_class = CxClientSerializer

    def perform_create(self, serializer):
        # Only admins can set an account manager
        if not self.request.user.is_staff:
            return Response({"error": "Only admins can assign an account manager."}, status=status.HTTP_403_FORBIDDEN)
        
        serializer.save()

class CxClientRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = CxClient.objects.all()
    serializer_class = CxClientSerializer

    def perform_update(self, serializer):
        # Restrict normal users from changing the account manager
        if not self.request.user.is_staff:
            return Response({"error": "Only admins can change the account manager."}, status=status.HTTP_403_FORBIDDEN)

        serializer.save()

class AccountManagersView(APIView):
    def get(self, request):
        managers_group = Group.objects.get(name="Account Managers")
        managers = User.objects.filter(groups=managers_group)
        return Response([
    {
        "id": manager.id,
        "full_name": f"{manager.first_name} {manager.last_name}",
        "email": manager.email,
        "phone_number": manager.profile.phone_number if hasattr(manager, "profile") else None
    } 
    for manager in managers
])

class AccountManagerRetrieveUpdateDestroyView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)

            if not user.groups.filter(name="Account Managers").exists():
                return Response({"error": "User is not an Account Manager"}, status=status.HTTP_400_BAD_REQUEST)

            data = request.data
            allowed_fields = ["first_name", "last_name", "email", "username"]

            # Update User fields
            for field in allowed_fields:
                if field in data:
                    if field == "username":
                        # Ensure the new username is unique
                        if User.objects.filter(username=data["username"]).exclude(pk=user.pk).exists():
                            return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)
                    setattr(user, field, data[field])

            # Update phone number in UserProfile
            if "phone_number" in data:
                if hasattr(user, "profile"):  # Ensure UserProfile exists
                    user.profile.phone_number = data["phone_number"]
                    user.profile.save()
                else:
                    return Response({"error": "User profile not found"}, status=status.HTTP_400_BAD_REQUEST)

            user.save()
            return Response({"message": "Account Manager updated successfully"}, status=status.HTTP_200_OK)
        
        except User.DoesNotExist:
            return Response({"error": "Account Manager not found"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            user = User.objects.get(pk=pk)

            if not user.groups.filter(name="Account Managers").exists():
                return Response({"error": "User is not an Account Manager"}, status=status.HTTP_400_BAD_REQUEST)

            user.delete()
            return Response({"message": "Account Manager deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({"error": "Account Manager not found"}, status=status.HTTP_404_NOT_FOUND)


