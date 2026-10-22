"""
Query engine for the AI Executive Decision Agent.

Provides a simple interface for asking questions about
project documents using the RAG answer generator.
"""

from rag.answer_generator import answer_question


def query_project(question, use_ai=False, top_k=3):
    """
    Answer a question about the project documentation.

    Args:
        question (str): User's question.
        use_ai (bool): Whether to attempt AI-generated answers.
        top_k (int): Number of relevant documents to retrieve.

    Returns:
        dict: Question, answer, and execution status.
    """

    if not isinstance(question, str) or not question.strip():
        return {
            "status": "error",
            "question": question,
            "answer": "Please enter a valid question.",
        }

    if not isinstance(top_k, int) or top_k < 1:
        return {
            "status": "error",
            "question": question,
            "answer": "top_k must be a positive integer.",
        }

    try:
        answer = answer_question(
            question=question.strip(),
            use_ai=use_ai,
            top_k=top_k,
        )

        return {
            "status": "success",
            "question": question.strip(),
            "answer": answer,
        }

    except Exception as error:
        return {
            "status": "error",
            "question": question.strip(),
            "answer": str(error),
        }


if __name__ == "__main__":
    print("=" * 55)
    print("AI EXECUTIVE DECISION AGENT - PROJECT QUERY ENGINE")
    print("=" * 55)

    question = input("\nEnter your project question: ").strip()

    if question:
        result = query_project(
            question=question,
            use_ai=False,
            top_k=3,
        )

        print("\nStatus:", result["status"])
        print("\nQuestion:", result["question"])
        print("\nAnswer:")
        print(result["answer"])
    else:
        print("Please enter a question.")