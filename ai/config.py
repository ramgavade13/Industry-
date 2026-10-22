"""
Central configuration for the AI Executive Decision Agent.

Loads environment variables from ai/.env and provides
shared application settings.
"""

import os
from pathlib import Path

from dotenv import load_dotenv


# Project directories
AI_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = AI_DIR.parent

# Load the environment file from the ai directory.
ENV_FILE = AI_DIR / ".env"
load_dotenv(ENV_FILE)


# Application settings
APP_NAME = os.getenv(
    "APP_NAME",
    "AI Executive Decision Agent",
)

APP_ENV = os.getenv(
    "APP_ENV",
    "development",
)

DEBUG = os.getenv(
    "DEBUG",
    "False",
).strip().lower() in {"true", "1", "yes"}


# Google Gemini settings
GEMINI_API_KEY = os.getenv(
    "GEMINI_API_KEY",
    "",
).strip()

GEMINI_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-2.5-flash",
).strip()


# PostgreSQL settings
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "",
).strip()


# RAG settings
CHROMA_PERSIST_DIRECTORY = os.getenv(
    "CHROMA_PERSIST_DIRECTORY",
    str(AI_DIR / "chroma_db"),
).strip()

CHROMA_COLLECTION_NAME = os.getenv(
    "CHROMA_COLLECTION_NAME",
    "executive_project_documents",
).strip()

try:
    RAG_TOP_K = int(os.getenv("RAG_TOP_K", "3"))
except ValueError:
    RAG_TOP_K = 3

if RAG_TOP_K < 1:
    RAG_TOP_K = 3


# Voice assistant settings
VOICE_LANGUAGE = os.getenv(
    "VOICE_LANGUAGE",
    "en-IN",
).strip()

try:
    VOICE_RATE = int(os.getenv("VOICE_RATE", "175"))
except ValueError:
    VOICE_RATE = 175

try:
    VOICE_VOLUME = float(os.getenv("VOICE_VOLUME", "1.0"))
except ValueError:
    VOICE_VOLUME = 1.0

VOICE_VOLUME = max(0.0, min(1.0, VOICE_VOLUME))


def get_config_summary():
    """
    Return a safe configuration summary.

    Secret values are never included.
    """

    return {
        "app_name": APP_NAME,
        "environment": APP_ENV,
        "debug": DEBUG,
        "gemini_configured": bool(GEMINI_API_KEY),
        "gemini_model": GEMINI_MODEL,
        "database_configured": bool(DATABASE_URL),
        "chroma_persist_directory": CHROMA_PERSIST_DIRECTORY,
        "chroma_collection_name": CHROMA_COLLECTION_NAME,
        "rag_top_k": RAG_TOP_K,
        "voice_language": VOICE_LANGUAGE,
        "voice_rate": VOICE_RATE,
        "voice_volume": VOICE_VOLUME,
    }


if __name__ == "__main__":
    print(f"Configuration for {APP_NAME}")
    print("-" * 40)

    for key, value in get_config_summary().items():
        print(f"{key}: {value}")