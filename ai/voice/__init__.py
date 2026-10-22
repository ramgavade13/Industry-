"""
Voice module for the AI Executive Decision Agent.

This package will handle:
1. Converting spoken questions into text.
2. Processing executive questions.
3. Converting text responses into speech.
"""

from .speech_to_text import speech_to_text
from .text_to_speech import text_to_speech

__all__ = [
    "speech_to_text",
    "text_to_speech",
]