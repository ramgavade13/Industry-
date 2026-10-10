
"""
ChromaDB Client for the RAG Module.

Responsibilities:
- Create a persistent local ChromaDB collection.
- Store document chunks and metadata.
- Search for relevant documents.
- Delete or reset the collection when required.
"""

from pathlib import Path
from functools import lru_cache


# AI project directory
AI_DIR = Path(__file__).resolve().parents[1]

# Local database directory
CHROMA_DB_DIR = AI_DIR / "chroma_db"

# Collection for project documentation
COLLECTION_NAME = "executive_project_documents"


@lru_cache(maxsize=4)
def _get_cached_client(persist_directory):
    """
    Return a cached ChromaDB client.

    Reusing the client avoids creating a new persistent client
    for every search during the same Python process.
    """

    try:
        import chromadb

    except ImportError as error:
        raise ImportError(
            "ChromaDB is not installed. Run:\n"
            "python -m pip install chromadb"
        ) from error

    return chromadb.PersistentClient(
        path=str(persist_directory)
    )


def get_chroma_collection(
    collection_name=COLLECTION_NAME,
    persist_directory=CHROMA_DB_DIR,
):
    """
    Create or retrieve a persistent ChromaDB collection.
    """

    persist_directory = Path(persist_directory).resolve()

    persist_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    client = _get_cached_client(str(persist_directory))

    collection = client.get_or_create_collection(
        name=collection_name,
        metadata={
            "description": (
                "Project documents for the "
                "AI Executive Decision Agent"
            )
        },
    )

    return collection


def add_documents(
    documents,
    collection_name=COLLECTION_NAME,
    persist_directory=CHROMA_DB_DIR,
):
    """
    Add or update document chunks in ChromaDB.

    Each document should contain:
    {
        "text": "Document text...",
        "metadata": {
            "source": "project_overview.txt",
            "chunk_index": 0
        }
    }

    Returns the number of chunks submitted.
    """

    if not documents:
        return 0

    collection = get_chroma_collection(
        collection_name=collection_name,
        persist_directory=persist_directory,
    )

    ids = []
    texts = []
    metadatas = []

    for index, document in enumerate(documents):

        if not isinstance(document, dict):
            continue

        text = document.get("text", "")

        if not isinstance(text, str):
            continue

        text = text.strip()

        if not text:
            continue

        metadata = document.get("metadata", {})

        if not isinstance(metadata, dict):
            metadata = {}

        safe_metadata = {}

        for key, value in metadata.items():

            if value is None:
                continue

            if isinstance(value, (str, int, float, bool)):
                safe_metadata[str(key)] = value
            else:
                safe_metadata[str(key)] = str(value)

        source = str(
            safe_metadata.get("source", "unknown")
        )

        chunk_index = safe_metadata.get(
            "chunk_index",
            index,
        )

        document_id = (
            f"{source}::chunk::{chunk_index}"
        )

        ids.append(document_id)
        texts.append(text)
        metadatas.append(safe_metadata)

    if not ids:
        return 0

    collection.upsert(
        ids=ids,
        documents=texts,
        metadatas=metadatas,
    )

    return len(ids)


def search_documents(
    query,
    n_results=5,
    collection_name=COLLECTION_NAME,
    persist_directory=CHROMA_DB_DIR,
):
    """
    Search the collection for relevant document chunks.

    Returns a list containing IDs, text, metadata, and distances.
    """

    if not isinstance(query, str) or not query.strip():
        raise ValueError(
            "query must be a non-empty string."
        )

    if (
        not isinstance(n_results, int)
        or isinstance(n_results, bool)
        or n_results < 1
    ):
        raise ValueError(
            "n_results must be a positive integer."
        )

    print(
        f"DEBUG: Opening ChromaDB collection "
        f"'{collection_name}'...",
        flush=True,
    )

    collection = get_chroma_collection(
        collection_name=collection_name,
        persist_directory=persist_directory,
    )

    print(
        "DEBUG: Checking ChromaDB collection count...",
        flush=True,
    )

    total_documents = collection.count()

    print(
        f"DEBUG: Collection contains "
        f"{total_documents} chunks.",
        flush=True,
    )

    if total_documents == 0:
        return []

    requested_results = min(
        n_results,
        total_documents,
    )

    print(
        f"DEBUG: Searching for up to "
        f"{requested_results} results...",
        flush=True,
    )

    result = collection.query(
        query_texts=[query.strip()],
        n_results=requested_results,
        include=[
            "documents",
            "metadatas",
            "distances",
        ],
    )

    print(
        "DEBUG: ChromaDB query returned.",
        flush=True,
    )

    documents = (
        result.get("documents") or [[]]
    )[0]

    metadatas = (
        result.get("metadatas") or [[]]
    )[0]

    distances = (
        result.get("distances") or [[]]
    )[0]

    ids = (
        result.get("ids") or [[]]
    )[0]

    matches = []

    for index, text in enumerate(documents):

        matches.append(
            {
                "id": (
                    ids[index]
                    if index < len(ids)
                    else None
                ),
                "text": text or "",
                "metadata": (
                    metadatas[index]
                    if index < len(metadatas)
                    and metadatas[index] is not None
                    else {}
                ),
                "distance": (
                    distances[index]
                    if index < len(distances)
                    else None
                ),
            }
        )

    print(
        f"DEBUG: Returning {len(matches)} search results.",
        flush=True,
    )

    return matches


def get_collection_count(
    collection_name=COLLECTION_NAME,
    persist_directory=CHROMA_DB_DIR,
):
    """Return the number of stored document chunks."""

    collection = get_chroma_collection(
        collection_name=collection_name,
        persist_directory=persist_directory,
    )

    return collection.count()


def delete_collection(
    collection_name=COLLECTION_NAME,
    persist_directory=CHROMA_DB_DIR,
):
    """
    Delete a collection and all its stored chunks.

    WARNING:
    This permanently removes the specified collection's data.
    """

    client = _get_cached_client(
        str(Path(persist_directory).resolve())
    )

    client.delete_collection(
        name=collection_name
    )

    # Clear cached clients after the database operation.
    _get_cached_client.cache_clear()

    return True


if __name__ == "__main__":

    print("\n=== CHROMADB CLIENT TEST ===\n", flush=True)

    try:

        sample_documents = [
            {
                "text": (
                    "Project Alpha is delayed because two important "
                    "tasks are incomplete. The project manager should "
                    "review blockers and update the delivery plan."
                ),
                "metadata": {
                    "source": "sample_project.txt",
                    "chunk_index": 0,
                },
            },
            {
                "text": (
                    "Financial review shows that spending should be "
                    "monitored against the approved project budget."
                ),
                "metadata": {
                    "source": "sample_finance.txt",
                    "chunk_index": 0,
                },
            },
        ]

        print(
            "Step 1: Adding sample documents...",
            flush=True,
        )

        inserted = add_documents(sample_documents)

        print(
            "Chunks submitted:",
            inserted,
            flush=True,
        )

        print(
            "Total chunks in collection:",
            get_collection_count(),
            flush=True,
        )

        queries = [
            "Which projects have delivery delays?",
            "How should financial spending be monitored?",
            "What should project managers monitor?",
        ]

        print(
            "\nStep 2: Testing document searches...",
            flush=True,
        )

        for index, query in enumerate(
            queries,
            start=1,
        ):

            print(
                f"\nStarting query {index}: {query}",
                flush=True,
            )

            results = search_documents(
                query=query,
                n_results=3,
            )

            print(
                f"Query {index} completed. "
                f"Results: {len(results)}",
                flush=True,
            )

            for result in results:
                print(
                    "Source:",
                    result["metadata"].get(
                        "source",
                        "unknown",
                    ),
                    flush=True,
                )

                print(
                    "Text:",
                    result["text"],
                    flush=True,
                )

        print(
            "\nChromaDB test completed successfully.",
            flush=True,
        )

    except Exception as error:

        import traceback

        print(
            "\nChromaDB test failed:",
            repr(error),
            flush=True,
        )

        traceback.print_exc()
