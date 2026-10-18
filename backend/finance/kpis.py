"""
KPI cards for the CEO dashboard (FR-05), calculated from the real data:

  Revenue, Expenses, Net Profit, Profit Margin  -> RevenueMonth (latest month vs the month before)
  Task Completion, Delayed Tasks                -> Task table
  Budget Variance                               -> Project table (actual spend vs planned spend so far)
  Projects at Risk                              -> RiskAlert table (written by the AI risk model)

RevenueMonth stores values in Rs lakhs, projects store full rupees.
Formulas follow the SRS: Revenue Growth = (Current - Previous) / Previous x 100,
Profit Margin = Profit / Revenue x 100, Task Completion = Completed / Total x 100.
"""

from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import CEO_ADMIN_MANAGER
from productivity.models import Project, Task
from risk.models import RiskAlert

from .models import RevenueMonth

LAKH = 100000


def _card(label, value, change="", trend="up"):
    return {"label": label, "value": value, "change": change, "trend": trend}


def _lakh(value):
    return f"₹{value:.1f}L"


def _percent_change(current, previous):
    if not previous:
        return ""
    return f"{(current - previous) / previous * 100:+.1f}%"


def build_kpis():
    cards = []

    # ---- Finance: latest month compared with the month before ----
    months = list(RevenueMonth.objects.order_by("id"))
    if months:
        cur = months[-1]
        prev = months[-2] if len(months) > 1 else None

        profit = cur.revenue - cur.expenses
        margin = profit / cur.revenue * 100 if cur.revenue else 0.0

        cards.append(_card(
            "Revenue", _lakh(cur.revenue),
            _percent_change(cur.revenue, prev.revenue) if prev else "",
            "up" if not prev or cur.revenue >= prev.revenue else "down",
        ))
        cards.append(_card(
            "Expenses", _lakh(cur.expenses),
            _percent_change(cur.expenses, prev.expenses) if prev else "",
            "up" if not prev or cur.expenses >= prev.expenses else "down",
        ))

        prev_profit = (prev.revenue - prev.expenses) if prev else None
        cards.append(_card(
            "Net Profit", _lakh(profit),
            _percent_change(profit, prev_profit) if prev else "",
            "up" if prev_profit is None or profit >= prev_profit else "down",
        ))

        prev_margin = (prev_profit / prev.revenue * 100) if prev and prev.revenue else None
        cards.append(_card(
            "Profit Margin", f"{margin:.1f}%",
            f"{margin - prev_margin:+.1f} pts" if prev_margin is not None else "",
            "up" if prev_margin is None or margin >= prev_margin else "down",
        ))

    # ---- Tasks ----
    total_tasks = Task.objects.count()
    if total_tasks:
        completed = Task.objects.filter(status="Completed").count()
        delayed = Task.objects.filter(status="Delayed").count()
        cards.append(_card("Task Completion", f"{round(completed / total_tasks * 100)}%"))
        cards.append(_card("Delayed Tasks", str(delayed), "", "down" if delayed else "up"))

    # ---- Projects: budget variance and risk ----
    open_projects = list(Project.objects.exclude(status="completed"))
    if open_projects:
        actual = sum(float(p.spent) for p in open_projects)
        planned = sum(float(p.budget) * min(max(p.progress, 0), 100) / 100 for p in open_projects)
        variance = (actual - planned) / LAKH
        cards.append(_card(
            "Budget Variance", f"{variance:+.1f}L".replace("+", "+₹").replace("-", "-₹"),
            "over plan" if variance > 0 else "under plan",
            "down" if variance > 0 else "up",
        ))

        at_risk = RiskAlert.objects.count()
        cards.append(_card(
            "Projects at Risk", f"{at_risk} of {len(open_projects)}", "",
            "down" if at_risk else "up",
        ))

    return cards


class KPIListView(APIView):
    """
    KPI cards calculated from the database.
    Accessible to Managers, Executives (CEO), and Administrators.
    """
    permission_classes = [CEO_ADMIN_MANAGER]

    def get(self, request):
        return Response(build_kpis())