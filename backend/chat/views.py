from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ChatMessage, ChatSession
from .services import ask_executive_assistant


class ChatView(APIView):
    """
    Executive AI Chat Assistant.
    Requires authenticated user with valid JWT bearer token.

    Body: {"message": "...", "save": true, "session_id": 3}
    - without "save" and "session_id" nothing is stored (used by the Voice page)
    - "save": true starts a new saved chat; "session_id" continues an existing one
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message = str(request.data.get("message", "")).strip()
        if not message:
            return Response({"detail": "Message is required."}, status=status.HTTP_400_BAD_REQUEST)

        session_id = request.data.get("session_id")
        save = bool(request.data.get("save")) or session_id not in (None, "")

        session = None
        if session_id not in (None, ""):
            # Only the owner can continue a chat; anyone else gets a 404.
            session = get_object_or_404(ChatSession, pk=session_id, user=request.user)

        reply = ask_executive_assistant(message, request.user)

        if not save:
            return Response({"reply": reply})

        if session is None:
            session = ChatSession.objects.create(user=request.user, title=message[:60])
        ChatMessage.objects.create(session=session, role="user", text=message)
        ChatMessage.objects.create(session=session, role="assistant", text=reply)
        session.save(update_fields=["updated_at"])
        return Response({"reply": reply, "session_id": session.id})


class ChatSessionListView(APIView):
    """GET /api/chat/sessions/ - my saved chats, newest first."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = ChatSession.objects.filter(user=request.user)[:50]
        return Response([
            {"id": s.id, "title": s.title, "updated_at": s.updated_at} for s in sessions
        ])


class ChatSessionDetailView(APIView):
    """GET one of my chats with its messages, or DELETE it."""
    permission_classes = [IsAuthenticated]

    def _session(self, request, pk):
        return get_object_or_404(ChatSession, pk=pk, user=request.user)

    def get(self, request, pk):
        session = self._session(request, pk)
        return Response({
            "id": session.id,
            "title": session.title,
            "messages": [
                {"id": m.id, "role": m.role, "text": m.text} for m in session.messages.all()
            ],
        })

    def delete(self, request, pk):
        self._session(request, pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)