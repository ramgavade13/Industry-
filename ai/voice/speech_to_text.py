"""
Speech-to-text module for the AI Executive Decision Agent.

Converts speech from an audio file into text.
"""

import speech_recognition as sr


def speech_to_text(audio_file=None, language="en-IN"):
    """
    Convert speech from an audio file into text.

    Args:
        audio_file (str): Path to the audio file.
        language (str): Language code for speech recognition.
                        Default is Indian English (en-IN).

    Returns:
        str: Recognized text, or an error message.
    """

    if not audio_file:
        return "Error: Please provide an audio file path."

    recognizer = sr.Recognizer()

    try:
        with sr.AudioFile(audio_file) as source:
            audio_data = recognizer.record(source)

        text = recognizer.recognize_google(
            audio_data,
            language=language
        )

        return text

    except sr.UnknownValueError:
        return "Sorry, I could not understand the audio."

    except sr.RequestError:
        return (
            "Error: Speech recognition service is unavailable. "
            "Please check your internet connection."
        )

    except FileNotFoundError:
        return f"Error: Audio file not found: {audio_file}"

    except ValueError:
        return (
            "Error: Unsupported audio format. "
            "Please use a compatible WAV audio file."
        )

    except Exception as error:
        return f"Unexpected error: {error}"


if __name__ == "__main__":
    print("AI Executive Decision Agent - Speech to Text")

    audio_path = input(
        "Enter the path of your WAV audio file: "
    ).strip()

    result = speech_to_text(audio_path)

    print("\nRecognized Text:")
    print(result)