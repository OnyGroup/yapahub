from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
from jwt import decode as jwt_decode
from jwt import InvalidTokenError
import urllib.parse

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
        # Try to get token from headers or query string
        headers = dict(scope['headers'])
        query_string = scope.get('query_string', b'').decode('utf-8')
        query_params = urllib.parse.parse_qs(query_string)
        
        token = None
        
        # Try to get token from headers
        if b'authorization' in headers:
            auth_header = headers[b'authorization'].decode('utf-8')
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        # If no token in headers, try query string
        if not token and 'token' in query_params:
            token = query_params['token'][0]
            
        if token:
            scope['user'] = await get_user(token)
        else:
            scope['user'] = AnonymousUser()
            
        return await super().__call__(scope, receive, send)