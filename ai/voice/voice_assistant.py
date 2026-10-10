"""
Voice assistant for the AI Executive Decision Agent.

Workflow:
1. Convert the user's audio question into text.
2. Send the question to the executive agent.
3. Convert the answer into spoken audio.
"""

from pathlib import Path

from voice.speech_to_text import speech_to_text
from voice.text_to_speech import text_to_speech


def get_executive_response(question):
    """
    Get a response from the executive agent.

    The executive agent currently provides a project analysis report.
    This function returns that report when a question is received.

    Args:
        question (str): The user's question.

    Returns:
        str: The executive agent's response.
    """

    if not isinstance(question, str) or not question.strip():
        return "Please provide a valid question."

    try:
        # Import only when required to avoid unnecessary imports.
        from agents.executive_agent import run_executive_analysis

        response = run_executive_analysis()

        if isinstance(response, str):
            return response

        if response is not None:
            return str(response)

        return "The executive agent did not return a response."

    except ImportError:
        return (
            "The executive agent could not be imported. "
            "Please check the agents folder and its function names."
        )

    except Exception as error:
        return f"Unable to generate an executive response: {error}"


def run_voice_assistant(audio_file, save_audio=True):
    """
    Process a spoken question and generate a spoken response.

    Args:
        audio_file (str): Path to the user's WAV audio file.
        save_audio (bool): Whether to save the spoken response.

    Returns:
        dict: Question, answer, and audio-generation status.
    """

    result = {
        "question": "",
        "answer": "",
        "audio_status": "",
    }

    # Step 1: Convert speech to text.
    question = speech_to_text(audio_file)

    if question.startswith("Error:") or question.startswith("Sorry,"):
        result["audio_status"] = question
        return result

    result["question"] = question

    # Step 2: Generate the executive response.
    answer = get_executive_response(question)
    result["answer"] = answer

    # Step 3: Convert the response to speech.
    if save_audio:
        output_path = Path("voice/output/executive_response.wav")

        result["audio_status"] = text_to_speech(
            answer,
            output_file=str(output_path),
        )
    else:
        result["audio_status"] = text_to_speech(answer)

    return result


if __name__ == "__main__":
    print("=" * 55)
    print("AI EXECUTIVE DECISION AGENT - VOICE ASSISTANT")
    print("=" * 55)

    audio_path = input(
        "Enter the path to your WAV question audio file: "
    ).strip()

    if not audio_path:
        print("Please provide an audio file path.")
    else:
        output = run_voice_assistant(audio_path)

        print("\nYour question:")
        print(output["question"])

        print("\nExecutive response:")
        print(output["answer"])

        print("\nAudio status:")
        print(output["audio_status"])