"""
Generates executive recommendations (FR-11) from the AI results and stores them
for the Recommendations page.

Inputs (all from the database / the AI modules):
  - project risk results   (risk.ml.engine - the risk model)
  - revenue & expense trend (forecasting.ml.trend - the forecast model)
  - team productivity      (TeamProductivity table)

This follows the rule-based recommendation approach in Pranav's recommendation
agent. Every sentence is built from real numbers; nothing is invented.

    python manage.py run_ai_recommendations
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from finance.models import RevenueMonth
from forecasting.ml.trend import forecast_series
from productivity.models import TeamProductivity
from recommendations.models import Recommendation
from risk.ml.engine import _flags, analyze_projects, load_project_rows

MAX_RECOMMENDATIONS = 6

PROJECT_ACTIONS = {
    "budget": "Review spend to date and agree a revised budget before approving new costs.",
    "deadline": "Confirm a realistic delivery date and add resources or reduce scope.",
    "tasks": "Clear the delayed tasks with their owners and remove what is blocking them.",
}


def project_recommendations():
    rows = {r["project_id"]: r for r in load_project_rows()}
    items = []
    for res in analyze_projects():
        level = res["risk_level"]
        if level == "Low":
            continue
        flags = _flags(rows[res["project_id"]])
        steps = [PROJECT_ACTIONS[k] for k in ("budget", "deadline", "tasks") if flags[k]]
        action = " ".join(steps) or "Review the project with its manager."
        if level == "High":
            action = "Hold a review with the project manager this week. " + action
        items.append((
            0 if level == "High" else 2,
            {
                "title": f"{'Review' if level == 'High' else 'Monitor'} {res['project_name']}",
                "problem": f"{res['project_name']} is at {level.lower()} risk.",
                "evidence": f"Risk score {res['score']}/100. {res['reason'][:1].upper()}{res['reason'][1:]}.",
                "action": action,
                "impact": "Acting early lowers the chance of a missed deadline or a budget overrun on this project.",
                "confidence": "High" if res["score"] >= 75 else "Medium",
            },
        ))
    return items


def finance_recommendations():
    history = list(RevenueMonth.objects.order_by("id"))
    if len(history) < 4:
        return []
    revenue = [h.revenue for h in history]
    expenses = [h.expenses for h in history]
    rev = forecast_series(revenue, 3, 3)
    exp = forecast_series(expenses, 3, 3)

    rev_now, exp_now = sum(revenue[-3:]), sum(expenses[-3:])
    rev_next, exp_next = sum(rev["future"]), sum(exp["future"])
    rev_growth = (rev_next - rev_now) / rev_now * 100 if rev_now else 0.0
    exp_growth = (exp_next - exp_now) / exp_now * 100 if exp_now else 0.0
    margin = (rev["future"][-1] - exp["future"][-1]) / rev["future"][-1] * 100 if rev["future"][-1] else 0.0

    items = []
    if exp_growth > rev_growth:
        items.append((1, {
            "title": "Control cost growth",
            "problem": (f"Expenses are forecast to grow faster ({exp_growth:.1f}%) than revenue "
                        f"({rev_growth:.1f}%) over the next quarter."),
            "evidence": (f"Next-quarter expenses ₹{exp_next:.1f}L against ₹{exp_now:.1f}L in the last quarter; "
                         f"revenue ₹{rev_next:.1f}L against ₹{rev_now:.1f}L."),
            "action": "Review the largest cost lines and hold non-essential spend until cost growth is back in line with revenue.",
            "impact": f"Protects the profit margin, which is forecast at about {margin:.1f}% by the end of the quarter.",
            "confidence": "Medium",
        }))
    if rev_growth < 0:
        items.append((1, {
            "title": "Revenue is forecast to fall",
            "problem": f"Next-quarter revenue is forecast {abs(rev_growth):.1f}% below the last quarter.",
            "evidence": f"Forecast ₹{rev_next:.1f}L against ₹{rev_now:.1f}L in the last quarter.",
            "action": "Review the sales pipeline and the biggest customer accounts this month.",
            "impact": "Early action can limit the shortfall before it reaches the quarter results.",
            "confidence": "Medium",
        }))
    return items


def productivity_recommendations():
    teams = list(TeamProductivity.objects.all())
    total_done = sum(t.completed for t in teams)
    total_all = sum(t.completed + t.pending for t in teams)
    if not total_all:
        return []
    average = total_done / total_all * 100

    items = []
    for t in teams:
        total = t.completed + t.pending
        if not total:
            continue
        rate = t.completed / total * 100
        if rate < 60 or rate < average - 10:
            items.append((rate, 3, {
                "title": f"Check workload in the {t.team} team",
                "problem": f"The {t.team} team has completed fewer tasks than the others.",
                "evidence": (f"{t.completed} of {total} tasks completed ({rate:.0f}%) "
                             f"against a company average of {average:.0f}%."),
                "action": f"Review the {t.team} team's blockers and rebalance tasks if anyone is overloaded.",
                "impact": "Raises delivery speed and lowers the number of tasks that become delayed.",
                "confidence": "Medium" if total >= 20 else "Low",
            }))
    items.sort(key=lambda x: x[0])  # weakest team first
    return [(p, rec) for _, p, rec in items[:2]]


class Command(BaseCommand):
    help = "Generate recommendations from the risk, forecast and productivity results."

    def handle(self, *args, **options):
        items = project_recommendations() + finance_recommendations() + productivity_recommendations()
        items.sort(key=lambda x: x[0])  # stable: high risks, finance, medium risks, productivity
        chosen = [rec for _, rec in items[:MAX_RECOMMENDATIONS]]

        with transaction.atomic():
            Recommendation.objects.all().delete()
            for rec in chosen:
                Recommendation.objects.create(**rec)

        self.stdout.write(self.style.SUCCESS(f"Saved {len(chosen)} recommendations."))
        for rec in chosen:
            self.stdout.write(f"  [{rec['confidence']}] {rec['title']}")