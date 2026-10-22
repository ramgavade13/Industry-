"""
Text-to-speech module for the AI Executive Decision Agent.

Converts written text into spoken audio.
"""

from pathlib import Path

import pyttsx3


def text_to_speech(text, output_file=None, rate=175, volume=1.0):
    """
    Convert text into speech.

    Args:
        text (str): Text to convert into speech.
        output_file (str, optional): Path to save the speech as a WAV file.
        rate (int): Speech speed. Default is 175.
        volume (float): Volume between 0.0 and 1.0.

    Returns:
        str: Success message or error message.
    """

    if not isinstance(text, str) or not text.strip():
        return "Error: Please provide valid text."

    if not 0.0 <= volume <= 1.0:
        return "Error: Volume must be between 0.0 and 1.0."

    if not isinstance(rate, int) or rate <= 0:
        return "Error: Speech rate must be a positive integer."

    engine = None

    try:
        engine = pyttsx3.init()

        engine.setProperty("rate", rate)
        engine.setProperty("volume", volume)

        if output_file:
            output_path = Path(output_file)
            output_path.parent.mkdir(
                parents=True,
                exist_ok=True
            )

            engine.save_to_file(
                text,
                str(output_path)
            )
            engine.runAndWait()

            return f"Speech audio saved to: {output_path}"

        engine.say(text)
        engine.runAndWait()

        return "Speech playback completed successfully."

    except Exception as error:
        return f"Text-to-speech error: {error}"

    finally:
        if engine is not None:
            try:
                engine.stop()
            except Exception:
                pass


if __name__ == "__main__":
    print("AI Executive Decision Agent - Text to Speech")

    message = input(
        "Enter the text you want the AI agent to speak: "
    ).strip()

    if message:
        result = text_to_speech(
            message,
            output_file="voice/output/response.wav"
        )
        print(result)
    else:
        print("No text entered.")