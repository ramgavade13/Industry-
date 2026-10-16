from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from accounts.permissions import CEO_ADMIN
from .services import ask_executive_assistant


class ChatView(APIView):
    permission_classes = [CEO_ADMIN]

    def post(self, request):
        message = request.data.get("message", "").strip()

        if not message:
            return Response({"detail": "Message is required."}, status=status.HTTP_400_BAD_REQUEST)

        reply = ask_executive_assistant(message)
        return Response({"reply": reply})