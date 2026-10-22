"""
RAG Document Loader

Loads text and Markdown documents and splits them into smaller chunks.

Supported formats:
- .txt
- .md
"""

from pathlib import Path
from typing import Any


SUPPORTED_EXTENSIONS = {".txt", ".md"}


def load_document(file_path):
    """
    Load a single text or Markdown document.

    Args:
        file_path: Path to the document.

    Returns:
        dict: Document text and metadata.
    """

    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(
            f"Document not found: {path}"
        )

    if not path.is_file():
        raise ValueError(
            f"Expected a file, received: {path}"
        )

    if path.suffix.lower() not in SUPPORTED_EXTENSIONS:
        raise ValueError(
            f"Unsupported file format: {path.suffix}. "
            "Use .txt or .md files."
        )

    # utf-8-sig also handles UTF-8 files that contain a BOM.
    text = path.read_text(encoding="utf-8-sig").strip()

    return {
        "text": text,
        "metadata": {
            "source": path.name,
            "file_path": str(path.resolve()),
            "file_type": path.suffix.lower(),
        },
    }


def split_text(
    text,
    chunk_size=1000,
    overlap=150,
):
    """
    Split text into smaller chunks.

    Args:
        text: Original document text.
        chunk_size: Maximum number of characters per chunk.
        overlap: Number of characters shared between chunks.

    Returns:
        list[str]: List of text chunks.
    """

    if not isinstance(text, str):
        raise TypeError("text must be a string.")

    if chunk_size <= 0:
        raise ValueError("chunk_size must be greater than zero.")

    if overlap < 0:
        raise ValueError("overlap cannot be negative.")

    if overlap >= chunk_size:
        raise ValueError(
            "overlap must be smaller than chunk_size."
        )

    text = text.strip()

    if not text:
        return []

    chunks = []
    start = 0
    text_length = len(text)

    while start < text_length:
        end = min(start + chunk_size, text_length)

        # Try to end at a word boundary where practical.
        if end < text_length:
            boundary = text.rfind(" ", start, end)

            if boundary > start:
                end = boundary

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        if end >= text_length:
            break

        # Move forward while preserving the requested overlap.
        start = max(0, end - overlap)

        # Prevent an infinite loop if no progress was made.
        if start >= end:
            start = end

    return chunks


def load_documents_from_directory(
    directory,
    recursive=True,
    chunk_size=1000,
    overlap=150,
):
    """
    Load supported documents from a directory and split them.

    Args:
        directory: Directory containing documents.
        recursive: Whether to search subdirectories.
        chunk_size: Maximum chunk size in characters.
        overlap: Number of overlapping characters.

    Returns:
        list[dict]: Chunks with source metadata.
    """

    directory = Path(directory)

    if not directory.exists():
        raise FileNotFoundError(
            f"Directory not found: {directory}"
        )

    if not directory.is_dir():
        raise ValueError(
            f"Expected a directory: {directory}"
        )

    if recursive:
        files = directory.rglob("*")
    else:
        files = directory.glob("*")

    documents = []

    for file_path in sorted(files):
        if not file_path.is_file():
            continue

        if file_path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            continue

        loaded = load_document(file_path)

        chunks = split_text(
            loaded["text"],
            chunk_size=chunk_size,
            overlap=overlap,
        )

        for index, chunk in enumerate(chunks):
            documents.append(
                {
                    "text": chunk,
                    "metadata": {
                        **loaded["metadata"],
                        "chunk_index": index,
                    },
                }
            )

    return documents


if __name__ == "__main__":
    # Find the ai directory from this file's location.
    AI_DIR = Path(__file__).resolve().parents[1]

    # Project documentation will be stored here.
    DOCUMENTS_DIR = AI_DIR / "documents"

    DOCUMENTS_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    # Create a sample document if the folder is empty.
    existing_documents = [
        path
        for path in DOCUMENTS_DIR.rglob("*")
        if path.is_file()
        and path.suffix.lower() in SUPPORTED_EXTENSIONS
    ]

    if not existing_documents:
        sample_file = DOCUMENTS_DIR / "project_overview.txt"

        sample_file.write_text(
            (
                "AI Executive Decision Agent\n\n"
                "The project analyzes financial performance, "
                "project risks, and employee task productivity. "
                "It combines these analyses to provide executive "
                "decision support and recommendations.\n\n"
                "Project managers should review high-risk projects, "
                "monitor spending against budgets, and investigate "
                "overdue tasks before making important decisions."
            ),
            encoding="utf-8",
        )

        print("Created sample document:", sample_file)

    print("\n=== RAG DOCUMENT LOADER TEST ===\n")

    try:
        chunks = load_documents_from_directory(
            DOCUMENTS_DIR,
            recursive=True,
            chunk_size=500,
            overlap=50,
        )

        print("Documents directory:", DOCUMENTS_DIR)
        print("Total chunks loaded:", len(chunks))

        for item in chunks:
            print("\nSource:", item["metadata"]["source"])
            print("Chunk:", item["metadata"]["chunk_index"])
            print("Text:", item["text"][:200])

    except Exception as error:
        print("Error:", error)