"""
Answer generator for the AI Executive Decision Agent.

Uses retrieved project documents to prepare answers.
Optionally uses Google Gemini to generate natural-language answers.
"""

import os

from dotenv import load_dotenv
from config import ENV_FILE

load_dotenv(ENV_FILE)

from rag.retrieval import retrieve_relevant_documents


def generate_rule_based_answer(question, documents):
    """Generate an answer using retrieved project documents."""

    if not documents:
        return (
            "I could not find relevant information in the project "
            "documents. Please add documents and index them first."
        )

    answer_parts = [
        f"Question: {question}",
        "",
        "Relevant information from project documents:",
    ]

    for index, document in enumerate(documents, start=1):
        content = document.get("text", "")
        source = document.get("source", "Unknown source")

        if content.strip():
            answer_parts.append(
                f"\n{index}. Source: {source}\n{content.strip()}"
            )

    answer_parts.append(
        "\nNote: This answer is based on retrieved document content."
    )

    return "\n".join(answer_parts)


def generate_ai_answer(question, documents):
    """Generate an answer using Gemini and retrieved project context."""

    if not documents:
        return generate_rule_based_answer(question, documents)

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key or api_key == "your_key_here":
        return generate_rule_based_answer(question, documents)

    try:
        import google.generativeai as genai

        genai.configure(api_key=api_key)

        model_name = os.getenv(
            "GEMINI_MODEL",
            "gemini-2.5-flash",
        )

        model = genai.GenerativeModel(model_name)

        context = "\n\n".join(
            [
                f"Source: {document.get('source', 'Unknown')}\n"
                f"{document.get('text', '')}"
                for document in documents
                if document.get("text", "").strip()
            ]
        )

        prompt = f"""
You are an AI Executive Decision Agent.

Answer the user's question using the supplied project documents.

Rules:
- Base factual claims on the supplied context.
- Do not invent financial figures, risks, or decisions.
- If the context does not contain enough information, say so.
- Give clear, concise answers suitable for business managers.
- Distinguish documented facts from recommendations.
- Mention the source when appropriate.

Project documents:
{context}

User question:
{question}

Provide the answer:
"""

        response = model.generate_content(prompt)
        answer = getattr(response, "text", None)

        if answer and answer.strip():
            return answer.strip()

        return generate_rule_based_answer(question, documents)

    except Exception as error:
        print(f"AI answer generation failed: {error}")
        return generate_rule_based_answer(question, documents)


def answer_question(question, use_ai=True, top_k=3):
    """
    Retrieve relevant documents and generate an answer.
    """

    if not isinstance(question, str) or not question.strip():
        return "Please enter a valid question."

    if not isinstance(top_k, int) or isinstance(top_k, bool) or top_k < 1:
        return "Error: top_k must be a positive integer."

    try:
        retrieval_result = retrieve_relevant_documents(
            question.strip(),
            top_k=top_k,
        )

        documents = retrieval_result.get("results", [])

        if use_ai:
            return generate_ai_answer(question.strip(), documents)

        return generate_rule_based_answer(question.strip(), documents)

    except Exception as error:
        return f"Unable to answer the question: {error}"

if __name__ == "__main__":
    print("AI Executive Decision Agent - RAG Answer Generator")

    user_question = input(
        "\nEnter your project question: "
    ).strip()

    if user_question:
        answer = answer_question(
            user_question,
            use_ai=False,
            top_k=3,
        )

        print("\nAnswer:")
        print(answer)
    else:
        print("Please enter a question.")