from django.contrib import admin
from django.urls import path
from .views import RegisterView, LoginView, VerifyTokenView, LogoutView, CurrentUserView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('verify/', VerifyTokenView.as_view(), name='verify-token'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("logout/", LogoutView.as_view(), name="logout"),
    path('me/', CurrentUserView.as_view(), name='current-user'),
]
