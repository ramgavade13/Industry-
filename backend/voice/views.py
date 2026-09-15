from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser
from django.http import HttpResponse
from urllib.parse import quote
from .services import voice_question_to_answer


class VoiceQueryView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        audio_file = request.FILES.get("audio")
        if not audio_file:
            return Response({"detail": "Audio file is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            question_text, answer_text, audio_answer = voice_question_to_answer(audio_file)
        except Exception as e:
            return Response({"detail": f"Could not process audio: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        response = HttpResponse(audio_answer, content_type="audio/mpeg")
        # Headers can't contain newlines or non-ASCII characters, so we URL-encode the text
        response["X-Question-Text"] = quote(question_text)
        response["X-Answer-Text"] = quote(answer_text)
        response["Access-Control-Expose-Headers"] = "X-Question-Text, X-Answer-Text"
        return response