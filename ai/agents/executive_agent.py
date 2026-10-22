
"""
AI Executive Decision Agent

Coordinates financial, project-risk, and productivity analysis.
Combines the results into one executive decision-support report.
"""

import json
import traceback

from agents.financial_agent import get_financial_recommendations
from agents.project_risk_agent import analyze_project_risks
from agents.productivity_agent import get_productivity_report
from agents.recommendation_agent import generate_recommendations


def run_financial_analysis():
    """Run financial analysis safely."""
    try:
        return get_financial_recommendations()
    except Exception as error:
        print(f"Financial analysis error: {error!r}", flush=True)
        traceback.print_exc()
        return {"status": "error", "message": str(error)}


def run_risk_analysis():
    """Run project-risk analysis safely."""
    try:
        return analyze_project_risks()
    except Exception as error:
        print(f"Project risk analysis error: {error!r}", flush=True)
        traceback.print_exc()
        return {"status": "error", "message": str(error)}


def run_productivity_analysis():
    """Run productivity analysis safely."""
    try:
        return get_productivity_report()
    except Exception as error:
        print(f"Productivity analysis error: {error!r}", flush=True)
        traceback.print_exc()
        return {"status": "error", "message": str(error)}



def create_executive_summary(reports):
    """Create a readable and professional executive summary."""

    financial = reports.get("financial", {})
    risk = reports.get("risk", {})
    productivity = reports.get("productivity", {})

    financial_analysis = financial.get("analysis", {})
    summary_parts = []

    # 1. Financial performance
    if financial_analysis.get("status") == "success":
        revenue = financial_analysis.get("total_revenue")
        expenses = financial_analysis.get("total_expenses")
        profit = financial_analysis.get("total_profit")
        margin = financial_analysis.get("profit_margin_percent")
        expense_trend = financial_analysis.get("expense_trend")

        if revenue is not None:
            summary_parts.append(
                f"Total recorded revenue is ₹{revenue:,.2f}."
            )

        if expenses is not None:
            summary_parts.append(
                f"Total recorded expenses are ₹{expenses:,.2f}."
            )

        if profit is not None:
            summary_parts.append(
                f"Total recorded profit is ₹{profit:,.2f}."
            )

        if margin is not None:
            summary_parts.append(
                f"The profit margin is {margin:.2f}%."
            )

        if expense_trend:
            summary_parts.append(
                f"The recorded expense trend is {expense_trend}."
            )

        utilization = financial_analysis.get(
            "budget_utilization_percent"
        )

        if utilization is not None:
            summary_parts.append(
                f"Recorded budget utilization is {utilization:.2f}%."
            )
        else:
            summary_parts.append(
                "Budget utilization cannot be calculated because "
                "suitable budget data is unavailable."
            )

    else:
        summary_parts.append(
            "Financial analysis is currently unavailable."
        )

    # 2. Project risk
    if risk.get("status") == "success":
        high_risk = risk.get("high_risk_projects", 0)
        medium_risk = risk.get("medium_risk_projects", 0)
        low_risk = risk.get("low_risk_projects", 0)

        summary_parts.append(
            f"Project risk analysis identified {high_risk} high-risk, "
            f"{medium_risk} medium-risk, and {low_risk} low-risk projects."
        )

    else:
        summary_parts.append(
            "Project risk information is currently unavailable."
        )

    # 3. Productivity
    if productivity.get("status") == "success":
        completed = productivity.get("completed_tasks", 0)
        total = productivity.get("total_tasks", 0)
        completion_rate = productivity.get(
            "completion_rate_percent", 0
        )
        overdue = productivity.get("overdue_tasks", 0)
        delayed = productivity.get("delayed_tasks", 0)

        summary_parts.append(
            f"{completed} of {total} tasks have been completed, "
            f"resulting in a completion rate of {completion_rate:.2f}%."
        )

        summary_parts.append(
            f"There are {overdue} overdue tasks requiring follow-up."
        )

        summary_parts.append(
            f"There are {delayed} tasks marked as delayed."
        )

    else:
        summary_parts.append(
            "Employee productivity information is currently unavailable."
        )

    # 4. Combine sentences with proper spacing
    return " ".join(summary_parts)



def determine_attention_level(reports):
    """
    Calculate a rule-based attention indicator.

    This is a decision-support indicator, not a validated business
    risk score.
    """

    financial = reports.get("financial", {})
    risk = reports.get("risk", {})
    productivity = reports.get("productivity", {})

    financial_analysis = financial.get("analysis", {})

    attention_reasons = []
    high_attention = False
    medium_attention = False

    # Financial indicators
    if financial_analysis.get("status") == "success":
        utilization = financial_analysis.get(
            "budget_utilization_percent"
        )

        if utilization is not None and utilization > 100:
            attention_reasons.append(
                "Recorded spending exceeds the recorded budget."
            )
            high_attention = True

        profit_margin = financial_analysis.get(
            "profit_margin_percent"
        )

        if profit_margin is not None and profit_margin < 0:
            attention_reasons.append(
                "Recorded expenses exceed revenue, resulting in "
                "a negative profit margin."
            )
            high_attention = True

        if financial_analysis.get("expense_trend") == "increasing":
            attention_reasons.append(
                "Expenses increased between the first and last "
                "recorded periods; review the reasons."
            )
            medium_attention = True

    # Project risk indicators
    if risk.get("status") == "success":
        high_risk = risk.get("high_risk_projects", 0)
        medium_risk = risk.get("medium_risk_projects", 0)

        if high_risk > 0:
            attention_reasons.append(
                f"{high_risk} project(s) have high or critical "
                "risk classifications."
            )
            high_attention = True

        if medium_risk > 0:
            attention_reasons.append(
                f"{medium_risk} project(s) have medium-risk "
                "classifications and should be monitored."
            )
            medium_attention = True

    # Productivity indicators
    if productivity.get("status") == "success":
        overdue = productivity.get("overdue_tasks", 0)
        delayed = productivity.get("delayed_tasks", 0)
        total_tasks = productivity.get("total_tasks", 0)
        completion_rate = productivity.get(
            "completion_rate_percent", 0
        )

        if overdue > 0:
            attention_reasons.append(
                f"{overdue} task(s) are overdue and need follow-up."
            )
            high_attention = True

        if delayed > 0:
            attention_reasons.append(
                f"{delayed} task(s) are marked delayed."
            )
            medium_attention = True

        if total_tasks > 0 and completion_rate < 50:
            attention_reasons.append(
                "The task completion rate is below 50%; "
                "review blockers and workload."
            )
            medium_attention = True

    if high_attention:
        level = "HIGH"
    elif medium_attention:
        level = "MEDIUM"
    else:
        level = "NORMAL"

    return {
        "level": level,
        "reasons": attention_reasons,
        "assessment_type": "rule_based",
    }


def run_executive_agent(use_ai=False):
    """Execute the analysis agents and generate a consolidated report."""

    print("Running financial analysis...", flush=True)
    financial_report = run_financial_analysis()

    print("Running project risk analysis...", flush=True)
    risk_report = run_risk_analysis()

    print("Running productivity analysis...", flush=True)
    productivity_report = run_productivity_analysis()

    reports = {
        "financial": financial_report,
        "risk": risk_report,
        "productivity": productivity_report,
    }

    print(
        f"Generating executive recommendations (use_ai={use_ai})...",
        flush=True,
    )

    recommendation_report = {
        "status": "error",
        "mode": "unavailable",
        "recommendation_count": 0,
        "recommendations": [],
        "message": "Recommendation generation has not completed.",
    }

    try:
        print("DEBUG 1: Preparing recommendation call.", flush=True)
        print(
            "DEBUG 2: AI enabled = "
            f"{use_ai}; report sections = {list(reports.keys())}",
            flush=True,
        )

        print("DEBUG 3: Calling recommendation agent now.", flush=True)

        recommendation_report = generate_recommendations(
            reports,
            use_ai=use_ai,
        )

        print("DEBUG 4: Recommendation agent returned.", flush=True)

        if not isinstance(recommendation_report, dict):
            recommendation_report = {
                "status": "error",
                "mode": "unavailable",
                "recommendation_count": 0,
                "recommendations": [],
                "message": (
                    "The recommendation agent returned an "
                    "unexpected result format."
                ),
            }

    except Exception as error:
        print(
            f"ERROR: Recommendation generation failed: {error!r}",
            flush=True,
        )
        traceback.print_exc()

        recommendation_report = {
            "status": "error",
            "mode": "unavailable",
            "recommendation_count": 0,
            "recommendations": [],
            "message": str(error),
        }

    print("DEBUG 5: Building executive summary.", flush=True)

    executive_summary = create_executive_summary(reports)
    attention = determine_attention_level(reports)

    financial_analysis_status = (
        financial_report.get("analysis", {}).get("status")
        if isinstance(financial_report, dict)
        else "error"
    )

    risk_status = (
        risk_report.get("status")
        if isinstance(risk_report, dict)
        else "error"
    )

    productivity_status = (
        productivity_report.get("status")
        if isinstance(productivity_report, dict)
        else "error"
    )

    recommendation_status = (
        recommendation_report.get("status")
        if isinstance(recommendation_report, dict)
        else "error"
    )

    all_components_succeeded = (
        financial_analysis_status == "success"
        and risk_status == "success"
        and productivity_status == "success"
        and recommendation_status == "success"
    )

    overall_status = (
        "success"
        if all_components_succeeded
        else "partial_success"
    )

    result = {
        "status": overall_status,
        "executive_summary": executive_summary,
        "attention_level": attention,
        "financial_report": financial_report,
        "project_risk_report": risk_report,
        "productivity_report": productivity_report,
        "recommendation_report": recommendation_report,
    }

    print("DEBUG 6: Executive report built successfully.", flush=True)

    return result


def run_executive_analysis(use_ai=False):
    """Return a readable executive report."""

    report = run_executive_agent(use_ai=use_ai)

    attention = report.get("attention_level", {})
    recommendation_report = report.get("recommendation_report", {})

    lines = [
        "AI Executive Decision Agent Report",
        "",
        "Executive Summary:",
        report.get(
            "executive_summary",
            "Executive summary is unavailable.",
        ),
        "",
        f"Overall Status: {report.get('status', 'unknown')}",
        f"Attention Level: {attention.get('level', 'UNKNOWN')}",
        "",
        "Reasons Requiring Attention:",
    ]

    reasons = attention.get("reasons", [])

    if reasons:
        lines.extend(f"- {reason}" for reason in reasons)
    else:
        lines.append(
            "No specific attention reasons were identified."
        )

    lines.extend([
        "",
        "Executive Recommendations:",
        json.dumps(
            recommendation_report,
            indent=2,
            default=str,
        ),
    ])

    return "\n".join(lines)


if __name__ == "__main__":
    print("\n======================================")
    print(" AI EXECUTIVE DECISION AGENT")
    print("======================================\n")

    report = run_executive_agent(use_ai=False)

    print("\n========== EXECUTIVE REPORT ==========\n")
    print(json.dumps(report, indent=2, default=str))

    print("\n======================================")
    print(" Report generation completed.")
    print("======================================")
