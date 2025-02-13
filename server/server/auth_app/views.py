from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import Group, User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        email = request.data.get("email")
        access_level = request.data.get("access_level")  # This field specifies the user's role

        if not username or not password or not email or not access_level:
            return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, password=password, email=email)

        # Assigning the user to the appropriate group based on access_level
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
        else:
            return Response({"error": "Invalid access level"}, status=status.HTTP_400_BAD_REQUEST)

        user.groups.add(group)
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
            "roles": groups  # Include the roles in the response
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
