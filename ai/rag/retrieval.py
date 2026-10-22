"""
RAG Retrieval Pipeline

Responsibilities:
1. Load project documentation.
2. Split documents into chunks.
3. Store chunks in ChromaDB.
4. Retrieve relevant chunks for a question.
5. Return source information with retrieved text.
"""

from pathlib import Path

from rag.document_loader import load_documents_from_directory
from rag.chroma_client import (
    add_documents,
    search_documents,
    get_collection_count,
)


# ai directory
AI_DIR = Path(__file__).resolve().parents[1]

# Folder containing project documentation
DOCUMENTS_DIR = AI_DIR / "documents"


def index_project_documents(
    directory=DOCUMENTS_DIR,
    chunk_size=1000,
    overlap=150,
):
    """
    Load and index documents into ChromaDB.

    Args:
        directory: Folder containing .txt and .md documents.
        chunk_size: Maximum characters per chunk.
        overlap: Number of overlapping characters.

    Returns:
        dict: Indexing status and statistics.
    """

    directory = Path(directory)

    if not directory.exists():
        raise FileNotFoundError(
            f"Documents directory not found: {directory}"
        )

    if not directory.is_dir():
        raise ValueError(
            f"Expected a documents directory: {directory}"
        )

    documents = load_documents_from_directory(
        directory=directory,
        recursive=True,
        chunk_size=chunk_size,
        overlap=overlap,
    )

    if not documents:
        return {
            "status": "no_documents",
            "message": (
                "No supported .txt or .md documents were found."
            ),
            "chunks_loaded": 0,
            "chunks_submitted": 0,
            "collection_count": get_collection_count(),
        }

    chunks_submitted = add_documents(documents)

    return {
        "status": "success",
        "documents_directory": str(directory),
        "chunks_loaded": len(documents),
        "chunks_submitted": chunks_submitted,
        "collection_count": get_collection_count(),
    }


def retrieve_relevant_documents(
    query,
    top_k=5,
):
    """
    Retrieve relevant document chunks for a question.

    Args:
        query: Executive's question.
        top_k: Maximum number of matching chunks.

    Returns:
        dict: Query and matching document chunks.
    """

    if not isinstance(query, str) or not query.strip():
        raise ValueError(
            "Please provide a non-empty question."
        )

    if top_k < 1:
        raise ValueError(
            "top_k must be at least 1."
        )

    results = search_documents(
        query=query.strip(),
        n_results=top_k,
    )

    formatted_results = []

    for result in results:
        metadata = result.get("metadata", {})

        formatted_results.append(
            {
                "source": metadata.get(
                    "source",
                    "unknown",
                ),
                "chunk_index": metadata.get(
                    "chunk_index",
                ),
                "text": result.get("text", ""),
                "distance": result.get("distance"),
            }
        )

    return {
        "status": (
            "success" if formatted_results else "no_results"
        ),
        "query": query,
        "result_count": len(formatted_results),
        "results": formatted_results,
    }


def prepare_rag_context(
    query,
    top_k=5,
):
    """
    Convert retrieved document chunks into context for an AI model.

    This function retrieves evidence. It does not generate an
    AI answer by itself.
    """

    retrieval_result = retrieve_relevant_documents(
        query=query,
        top_k=top_k,
    )

    if not retrieval_result["results"]:
        return {
            "status": "no_results",
            "query": query,
            "context": "",
            "sources": [],
        }

    context_parts = []
    sources = []

    for index, result in enumerate(
        retrieval_result["results"],
        start=1,
    ):
        source = result["source"]

        context_parts.append(
            f"[Source {index}: {source}]\n"
            f"{result['text']}"
        )

        if source not in sources:
            sources.append(source)

    return {
        "status": "success",
        "query": query,
        "context": "\n\n".join(context_parts),
        "sources": sources,
    }


if __name__ == "__main__":
    print("\n=== RAG RETRIEVAL TEST ===\n")

    try:
        # Index the project documents.
        print("Step 1: Indexing project documents...")

        indexing_result = index_project_documents()

        print("Indexing status:", indexing_result["status"])
        print(
            "Chunks submitted:",
            indexing_result["chunks_submitted"],
        )
        print(
            "Total chunks in collection:",
            indexing_result["collection_count"],
        )

        # Search the stored documents.
        question = (
            "What are the main project risks and "
            "management actions?"
        )

        print("\nStep 2: Searching project documents...")
        print("Question:", question)

        result = retrieve_relevant_documents(
            query=question,
            top_k=3,
        )

        if result["results"]:
            for index, item in enumerate(
                result["results"],
                start=1,
            ):
                print(f"\nResult {index}")
                print("Source:", item["source"])
                print("Text:", item["text"])
                print("Distance:", item["distance"])

        else:
            print(
                "No relevant documents were found. "
                "Add project documentation and run indexing again."
            )

        # Prepare context for a future AI response.
        print("\nStep 3: Preparing AI context...")

        context_result = prepare_rag_context(
            query=question,
            top_k=3,
        )

        print("\nSources:", context_result["sources"])
        print("\nPrepared context:")
        print(context_result["context"])

    except Exception as error:
        print("\nRAG retrieval failed:")
        print(error)