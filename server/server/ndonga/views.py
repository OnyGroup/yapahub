from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import openai
import os
import json

# Load OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

@csrf_exempt  # Disable CSRF protection for simplicity (use with caution)
def chat(request):
    if request.method == "POST":
        try:
            # Parse JSON data from the request body
            body = json.loads(request.body)
            user_input = body.get("message")

            # Generate a response using OpenAI's GPT-3.5/4
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are Ndonga, an AI assistant for business analytics."},
                    {"role": "user", "content": user_input}
                ],
                max_tokens=150
            )

            # Extract the assistant's reply
            assistant_reply = response.choices[0].message["content"]

            return JsonResponse({"response": assistant_reply})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=400)