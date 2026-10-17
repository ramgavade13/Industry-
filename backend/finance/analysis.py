"""
Builds the consolidated executive analysis (same shape as Pranav's
run_executive_agent report) from the REAL data in the system:

  - financials   -> RevenueMonth table
  - project risk -> the risk model (risk.ml.engine)
  - productivity -> TeamProductivity and Task tables
  - recommendations -> Recommendation table

Nothing here is hardcoded. If a part has no data, it says so.
"""

from productivity.models import Task, TeamProductivity
from recommendations.models import Recommendation
from risk.ml.engine import analyze_projects, load_project_rows

from .models import RevenueMonth

LAKH = 100000  # RevenueMonth stores values in ₹ lakhs


def _financial_report():
    history = list(RevenueMonth.objects.order_by("id"))
    if not history:
        return {"analysis": {"status": "no_data"}, "recommendations": []}

    revenue = sum(h.revenue for h in history) * LAKH
    expenses = sum(h.expenses for h in history) * LAKH
    profit = revenue - expenses
    return {
        "analysis": {
            "status": "success",
            "months_covered": len(history),
            "total_revenue": int(revenue),
            "total_expenses": int(expenses),
            "total_profit": int(profit),
            "profit_margin_percent": round(profit / revenue * 100, 1) if revenue else None,
        },
        "recommendations": [],
    }


def _risk_report():
    try:
        results = analyze_projects()
        details = {r["project_id"]: r for r in load_project_rows()}
    except Exception as error:  # the model or its data is unavailable
        return {"status": "unavailable", "message": str(error), "projects": [], "recommendations": []}

    counts = {"High": 0, "Medium": 0, "Low": 0}
    projects = []
    for res in results:
        counts[res["risk_level"]] = counts.get(res["risk_level"], 0) + 1
        d = details[res["project_id"]]
        projects.append({
            "project_id": res["project_id"],
            "project_name": res["project_name"],
            "risk_level": res["risk_level"].upper(),
            "risk_score": res["score"],
            "reason": res["reason"] if res["risk_level"] != "Low" else "",
            "budget_used_percentage": d["budget_used_pct"],
            "progress_percentage": d["progress"],
            "days_remaining": d["deadline_days"],
            "delayed_tasks": int(d["delayed_tasks"]),
        })
    return {
        "status": "success",
        "total_projects_analyzed": len(results),
        "high_risk_projects": counts["High"],
        "medium_risk_projects": counts["Medium"],
        "low_risk_projects": counts["Low"],
        "projects": projects,
        "recommendations": [],
    }


def _productivity_report():
    teams = list(TeamProductivity.objects.all())
    done = sum(t.completed for t in teams)
    total = done + sum(t.pending for t in teams)
    if not total:
        return {"status": "no_data", "teams": [], "recommendations": []}

    return {
        "status": "success",
        "total_tasks": total,
        "completed_tasks": done,
        "incomplete_tasks": total - done,
        "delayed_tasks": Task.objects.filter(status="At risk").count(),  # tasks marked At risk
        "completion_rate_percent": round(done / total * 100, 1),
        "teams": [
            {
                "team": t.team,
                "completed": t.completed,
                "pending": t.pending,
                "completion_rate_percent": round(t.completed / (t.completed + t.pending) * 100, 1)
                if (t.completed + t.pending) else None,
            }
            for t in teams
        ],
        "recommendations": [],
    }


def _recommendation_report():
    items = [
        {
            "priority": (r.confidence or "").upper(),
            "area": r.title,
            "recommendation": r.action,
            "reason": r.problem,
        }
        for r in Recommendation.objects.all()
    ]
    return {
        "status": "success" if items else "no_data",
        "mode": "AI risk and forecast results",
        "recommendation_count": len(items),
        "recommendations": items,
    }


def _attention_level(risk):
    if risk.get("status") != "success":
        return {"level": "UNKNOWN", "reasons": ["Project risk results are unavailable."],
                "assessment_type": "Automated AI Analysis"}

    high = [p["project_name"] for p in risk["projects"] if p["risk_level"] == "HIGH"]
    medium = [p["project_name"] for p in risk["projects"] if p["risk_level"] == "MEDIUM"]
    reasons = []
    if high:
        reasons.append(f"{len(high)} high-risk project(s): {', '.join(high[:3])}")
    if medium:
        reasons.append(f"{len(medium)} medium-risk project(s): {', '.join(medium[:3])}")
    if not reasons:
        reasons.append("No projects are currently at risk.")
    return {
        "level": "HIGH" if high else ("MEDIUM" if medium else "LOW"),
        "reasons": reasons,
        "assessment_type": "Automated AI Analysis",
    }


def _summary(financial, risk, productivity):
    parts = []
    if risk.get("status") == "success":
        at_risk = risk["high_risk_projects"] + risk["medium_risk_projects"]
        parts.append(
            f"{at_risk} of {risk['total_projects_analyzed']} projects are at risk "
            f"({risk['high_risk_projects']} high, {risk['medium_risk_projects']} medium)."
        )
    analysis = financial["analysis"]
    if analysis.get("status") == "success" and analysis.get("profit_margin_percent") is not None:
        parts.append(
            f"Profit margin over the {analysis['months_covered']} recorded months is "
            f"{analysis['profit_margin_percent']}%."
        )
    if productivity.get("status") == "success":
        parts.append(f"Teams have completed {productivity['completion_rate_percent']}% of their tasks.")
    return " ".join(parts) or "Not enough data to build a summary yet."


def build_executive_analysis():
    financial = _financial_report()
    risk = _risk_report()
    productivity = _productivity_report()
    recommendations = _recommendation_report()

    all_ok = (
        financial["analysis"].get("status") == "success"
        and risk.get("status") == "success"
        and productivity.get("status") == "success"
        and recommendations.get("status") == "success"
    )
    return {
        "status": "success" if all_ok else "partial_success",
        "executive_summary": _summary(financial, risk, productivity),
        "attention_level": _attention_level(risk),
        "financial_report": financial,
        "project_risk_report": risk,
        "productivity_report": productivity,
        "recommendation_report": recommendations,
    }