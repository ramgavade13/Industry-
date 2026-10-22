"""
RAG package for the AI Executive Decision Agent.

Provides document loading, retrieval, and question-answering
functionality for project-related queries.
"""

from rag.answer_generator import answer_question
from rag.query_engine import query_project
from rag.retrieval import (
    index_project_documents,
    prepare_rag_context,
    retrieve_relevant_documents,
)

__all__ = [
    "answer_question",
    "query_project",
    "index_project_documents",
    "prepare_rag_context",
    "retrieve_relevant_documents",
]