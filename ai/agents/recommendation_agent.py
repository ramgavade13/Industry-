
"""
Executive Recommendation Agent

Responsibilities:
1. Accept financial, project risk, and productivity reports.
2. Generate practical executive recommendations.
3. Retrieve relevant project documents using RAG.
4. Use Google Gemini when configured.
5. Work without an API key using rule-based recommendations.
"""

import json
import os

from rag.retrieval import retrieve_relevant_documents


def get_document_context(context):
    """
    Retrieve relevant information from project documents.

    Args:
        context (dict): Financial, risk, and productivity reports.

    Returns:
        list: Relevant document passages and their sources.
    """

    queries = [
        "What should project managers monitor?",
        "How should financial performance and project risks be managed?",
        "How can overdue tasks and productivity issues be addressed?",
    ]

    document_context = []

    try:
        for query in queries:
            result = retrieve_relevant_documents(
                query=query,
                top_k=3,
            )

            if result.get("status") != "success":
                continue

            for document in result.get("results", []):
                text = document.get("text", "").strip()
                source = document.get("source", "Unknown")

                if text:
                    document_context.append({
                        "source": source,
                        "text": text,
                    })

    except Exception as error:
        print(
            "Warning: Project-document retrieval failed:",
            error,
        )

    # Remove duplicate passages.
    unique_context = []
    seen_texts = set()

    for document in document_context:
        text = document["text"]

        if text not in seen_texts:
            seen_texts.add(text)
            unique_context.append(document)

    return unique_context


def generate_rule_based_recommendations(context):
    """
    Generate recommendations without an external AI API.

    Args:
        context (dict): Reports from other project agents.

    Returns:
        dict: Executive recommendations.
    """

    recommendations = []

    financial = context.get("financial", {})
    risk = context.get("risk", {})
    productivity = context.get("productivity", {})

    # Financial recommendations.
    if financial.get("status") == "success":
        utilization = financial.get(
            "budget_utilization_percent"
        )

        if utilization is not None:
            if utilization > 100:
                recommendations.append({
                    "priority": "HIGH",
                    "area": "Finance",
                    "recommendation": (
                        "Review budget overruns and identify the "
                        "main causes of excess spending."
                    ),
                    "reason": (
                        f"Recorded budget utilization is {utilization}%."
                    ),
                })

            elif utilization >= 90:
                recommendations.append({
                    "priority": "MEDIUM",
                    "area": "Finance",
                    "recommendation": (
                        "Review remaining budgets and forecast "
                        "expected spending before approving new costs."
                    ),
                    "reason": (
                        f"Recorded budget utilization is {utilization}%."
                    ),
                })

    # Project risk recommendations.
    if risk.get("status") == "success":
        high_risk = risk.get("high_risk_projects", 0)
        medium_risk = risk.get("medium_risk_projects", 0)

        if high_risk > 0:
            recommendations.append({
                "priority": "HIGH",
                "area": "Project Risk",
                "recommendation": (
                    "Arrange a review of high-risk projects and "
                    "assign owners to their most urgent issues."
                ),
                "reason": (
                    f"{high_risk} project(s) have high or critical "
                    "risk classifications."
                ),
            })

        if medium_risk > 0:
            recommendations.append({
                "priority": "MEDIUM",
                "area": "Project Risk",
                "recommendation": (
                    "Monitor medium-risk projects and review "
                    "their progress regularly."
                ),
                "reason": (
                    f"{medium_risk} project(s) have medium-risk "
                    "classifications."
                ),
            })

    # Productivity recommendations.
    if productivity.get("status") == "success":
        overdue = productivity.get("overdue_tasks", 0)

        if overdue > 0:
            recommendations.append({
                "priority": "HIGH",
                "area": "Productivity",
                "recommendation": (
                    "Review overdue tasks with the responsible "
                    "team members and identify blockers."
                ),
                "reason": (
                    f"{overdue} task(s) are recorded as overdue."
                ),
            })

    # General recommendation when no warning indicators are found.
    if not recommendations:
        recommendations.append({
            "priority": "LOW",
            "area": "General",
            "recommendation": (
                "Review the latest financial, risk, and task reports "
                "before making major decisions."
            ),
            "reason": (
                "The available reports did not contain enough "
                "recognized warning indicators to create more "
                "specific recommendations."
            ),
        })

    # Sort recommendations by priority.
    priority_order = {
        "HIGH": 1,
        "MEDIUM": 2,
        "LOW": 3,
    }

    recommendations.sort(
        key=lambda item: priority_order.get(
            item["priority"], 4
        )
    )

    return {
        "status": "success",
        "mode": "rule_based",
        "recommendation_count": len(recommendations),
        "recommendations": recommendations,
    }



def generate_ai_recommendations(context):
    """
    Generate recommendations using Google Gemini and RAG.

    Normalize AI-generated text, validate the response,
    and fall back to rule-based recommendations if needed.
    """

    import re

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        return generate_rule_based_recommendations(context)

    def clean_text(value):
        """Normalize whitespace without changing the meaning."""
        if not isinstance(value, str):
            return value

        # Replace repeated whitespace and line breaks with one space.
        value = re.sub(r"\s+", " ", value).strip()

        # Restore spaces accidentally omitted around punctuation.
        value = re.sub(r"(?<=[a-z])(?=[A-Z])", " ", value)

        # Restore spaces between words and numbers where missing.
        value = re.sub(r"(?<=[a-zA-Z])(?=\d)", " ", value)
        value = re.sub(r"(?<=\d)(?=[a-zA-Z])", " ", value)

        return value

    try:
        import google.generativeai as genai

        genai.configure(api_key=api_key)

        model_name = os.getenv(
            "GEMINI_MODEL",
            "gemini-3.8-flash",
        )

        model = genai.GenerativeModel(model_name)

        # Retrieve relevant passages from project documents.
        document_context = get_document_context(context)

        # Create the prompt for Gemini.
        prompt = f"""
You are an executive decision-support assistant
for the AI Executive Decision Agent project.

Analyze the supplied financial, project-risk, and productivity
reports and generate practical recommendations for management.

Rules:
1. Use only facts supported by the supplied reports
   or retrieved project documents.
2. Never invent financial figures or project facts.
3. Prioritize urgent financial, project-risk,
   and productivity issues.
4. Explain the reason for every recommendation.
5. Use project documents as supporting guidance,
   not as proof of current project conditions.
6. Do not claim that predictions are certain.
7. Return valid JSON only, without Markdown code fences.
8. Priorities must be HIGH, MEDIUM, or LOW.
9. Recommendations must be actionable and specific.
10. Use normal spacing between all words, numbers, and punctuation.
11. Proofread the summary and recommendations before returning JSON.

Expected JSON format:
{{
  "summary": "Short executive summary",
  "recommendations": [
    {{
      "priority": "HIGH",
      "area": "Finance",
      "recommendation": "Recommended action",
      "reason": "Evidence supporting the action"
    }}
  ]
}}

Financial, risk, and productivity reports:
{json.dumps(context, indent=2, default=str)}

Retrieved project-document context:
{json.dumps(document_context, indent=2, default=str)}
"""

        # Ask Gemini to generate recommendations.
        response = model.generate_content(prompt)

        response_text = (response.text or "").strip()

        if not response_text:
            raise ValueError(
                "Gemini returned an empty response."
            )

        # Remove Markdown code fences if present.
        if response_text.startswith("```"):
            lines = response_text.splitlines()

            if lines and lines[0].startswith("```"):
                lines = lines[1:]

            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]

            response_text = "\n".join(lines).strip()

            if response_text.lower().startswith("json"):
                response_text = response_text[4:].strip()

        # Parse the response as JSON.
        result = json.loads(response_text)

        if not isinstance(result, dict):
            raise ValueError(
                "The AI response must be a JSON object."
            )

        recommendations = result.get("recommendations", [])

        if not isinstance(recommendations, list):
            raise ValueError(
                "The AI recommendations field must be a list."
            )

        # Validate and clean individual recommendations.
        for recommendation in recommendations:
            if not isinstance(recommendation, dict):
                raise ValueError(
                    "Each recommendation must be a JSON object."
                )

            required_fields = (
                "priority",
                "area",
                "recommendation",
                "reason",
            )

            if not all(
                field in recommendation
                for field in required_fields
            ):
                raise ValueError(
                    "A recommendation is missing required fields."
                )

            priority = str(
                recommendation["priority"]
            ).upper().strip()

            if priority not in {"HIGH", "MEDIUM", "LOW"}:
                raise ValueError(
                    "Recommendation priority must be HIGH, MEDIUM, or LOW."
                )

            recommendation["priority"] = priority

            # Normalize text fields.
            for field in (
                "area",
                "recommendation",
                "reason",
            ):
                recommendation[field] = clean_text(
                    recommendation[field]
                )

        # Clean the executive summary.
        summary = clean_text(result.get("summary", ""))

        return {
            "status": "success",
            "mode": "gemini",
            "summary": summary,
            "recommendation_count": len(recommendations),
            "recommendations": recommendations,
        }

    except Exception as error:
        # Preserve the existing rule-based fallback.
        fallback = generate_rule_based_recommendations(context)

        fallback["ai_error"] = str(error)
        fallback["message"] = (
            "AI recommendations could not be generated. "
            "Rule-based recommendations are provided instead."
        )

        return fallback


def generate_recommendations(context=None, use_ai=True):
    """
    Public function used by other project agents.

    Args:
        context (dict): Reports from other agents.
        use_ai (bool): Whether to attempt Gemini generation.

    Returns:
        dict: Executive recommendations.
    """

    if context is None:
        context = {}

    if not isinstance(context, dict):
        return {
            "status": "error",
            "message": "Context must be a dictionary.",
            "recommendations": [],
        }

    if not isinstance(use_ai, bool):
        return {
            "status": "error",
            "message": "use_ai must be True or False.",
            "recommendations": [],
        }

    if use_ai:
        return generate_ai_recommendations(context)

    return generate_rule_based_recommendations(context)


if __name__ == "__main__":
    # Sample data for testing.
    # These values are examples, not actual business results.

    sample_context = {
        "financial": {
            "status": "success",
            "budget_utilization_percent": 95.0,
        },
        "risk": {
            "status": "success",
            "high_risk_projects": 2,
            "medium_risk_projects": 1,
        },
        "productivity": {
            "status": "success",
            "overdue_tasks": 4,
        },
    }

    print("\n=== EXECUTIVE RECOMMENDATION AGENT ===\n")

    result = generate_recommendations(
        sample_context,
        use_ai=False,
    )

    print(json.dumps(result, indent=2))
