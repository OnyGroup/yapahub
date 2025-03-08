from django.contrib import admin
from django.urls import path
from .views import RegisterView, LoginView, VerifyTokenView, LogoutView, CurrentUserView, CxClientListCreateView, CxClientRetrieveUpdateDestroyView, AccountManagersView, AccountManagerRetrieveUpdateDestroyView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('verify/', VerifyTokenView.as_view(), name='verify-token'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("logout/", LogoutView.as_view(), name="logout"),
    path('me/', CurrentUserView.as_view(), name='current-user'),

    # cx client management
    path('clients/', CxClientListCreateView.as_view(), name='client-list-create'),
    path('clients/<int:pk>/', CxClientRetrieveUpdateDestroyView.as_view(), name='client-detail'),
    path("account-managers/", AccountManagersView.as_view(), name="account-managers"),
    path("account-managers/<int:pk>/", AccountManagerRetrieveUpdateDestroyView.as_view(), name="account-manager-update-delete"),
]
