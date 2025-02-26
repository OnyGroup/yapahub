# Create a new file: inbox/middleware.py

from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
from jwt import decode as jwt_decode
from jwt import InvalidTokenError

User = get_user_model()

@database_sync_to_async
def get_user(token_key):
    try:
        # Decode the token
        decoded_data = jwt_decode(token_key, options={"verify_signature": False})
        # Get user from decoded token
        user_id = decoded_data.get('user_id')
        return User.objects.get(id=user_id)
    except (InvalidTokenError, User.DoesNotExist):
        return AnonymousUser()

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        # Get the token from the headers
        headers = dict(scope['headers'])
        authorization = headers.get(b'authorization', b'').decode('utf8')
        
        if authorization.startswith('Bearer '):
            token = authorization.split(' ')[1]
            scope['user'] = await get_user(token)
        else:
            scope['user'] = AnonymousUser()
            
        return await super().__call__(scope, receive, send)