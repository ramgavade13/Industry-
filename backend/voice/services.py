import speech_recognition as sr
from gtts import gTTS
from io import BytesIO
from chat.services import ask_executive_assistant


def transcribe_audio(audio_file) -> str:
    """Converts an uploaded audio file into text using Google's free speech API."""
    recognizer = sr.Recognizer()
    with sr.AudioFile(audio_file) as source:
        audio_data = recognizer.record(source)
    text = recognizer.recognize_google(audio_data)
    return text


def synthesize_speech(text: str) -> BytesIO:
    """Converts text into spoken audio (MP3) using gTTS."""
    tts = gTTS(text=text, lang="en")
    buffer = BytesIO()
    tts.write_to_fp(buffer)
    buffer.seek(0)
    return buffer


def voice_question_to_answer(audio_file):
    """Full pipeline: audio in -> text question -> AI answer -> speech out."""
    question_text = transcribe_audio(audio_file)
    answer_text = ask_executive_assistant(question_text)
    audio_answer = synthesize_speech(answer_text)
    return question_text, answer_text, audio_answer