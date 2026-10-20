import os
import time
import hashlib
import logging

import google.generativeai as genai
from django.core.cache import cache
from google.api_core import exceptions as gexc

from finance.models import KPI, RevenueMonth
from finance.kpi_cards import kpi_cards
from risk.models import RiskAlert
from productivity.models import TeamProductivity, Task
from productivity.serializers import MyTaskSerializer

logger = logging.getLogger(__name__)

# REST transport avoids the gRPC hangs seen on some Windows networks.
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"), transport="rest")

# Each Gemini model has its own free daily quota, so we try them in order.
# Set GEMINI_MODELS in .env as a comma-separated list.
DEFAULT_MODELS = ["gemini-3.6-flash"]
COOLDOWN_SECONDS = 30 * 60   # skip a model for 30 min after it hits its quota
CACHE_SECONDS = 5 * 60       # reuse the same answer for 5 minutes

_exhausted_until = {}

# What each role may see (SRS Sections 5 and 14).
FULL_ACCESS = {"kpis", "revenue", "risks", "productivity"}
ROLE_ACCESS = {
    "ceo": FULL_ACCESS,
    "admin": FULL_ACCESS,
    "manager": {"kpis", "risks", "productivity"},
    "employee": set(),  # employees only get their own tasks
}

DENIED = "Your role doesn't have access to that information."


def _role_of(user):
    return getattr(user, "role", None) or "employee"


def _allowed(user):
    return ROLE_ACCESS.get(_role_of(user), set())


def _model_names():
    raw = os.environ.get("GEMINI_MODELS", "")
    names = [m.strip() for m in raw.split(",") if m.strip()]
    return names or DEFAULT_MODELS


def _my_tasks(user):
    if user is None or not getattr(user, "is_authenticated", False):
        return []
    return list(MyTaskSerializer(Task.objects.filter(assignee=user), many=True).data)


def build_business_context(user):
    """Pulls real data from the database, limited to what this user's role may see."""
    allowed = _allowed(user)
    sections = []

    if "kpis" in allowed:
        text = "\n".join(f"- {k.label}: {k.value} ({k.change})" for k in kpi_cards())
        sections.append(f"KPIs:\n{text}")

    if "revenue" in allowed:
        text = "\n".join(
            f"- {r.month}: revenue ₹{r.revenue}L, expenses ₹{r.expenses}L"
            for r in RevenueMonth.objects.all().order_by("id")
        )
        sections.append(f"Revenue trend:\n{text}")

    if "risks" in allowed:
        text = "\n".join(
            f"- {r.project}: {r.risk} ({r.severity} severity)" for r in RiskAlert.objects.all()
        ) or "No active risks."
        sections.append(f"Risk alerts:\n{text}")

    if "productivity" in allowed:
        text = "\n".join(
            f"- {p.team}: {p.completed} tasks completed, {p.pending} pending"
            for p in TeamProductivity.objects.all()
        )
        sections.append(f"Team productivity:\n{text}")

    if _role_of(user) == "employee":
        tasks = _my_tasks(user)
        text = "\n".join(
            f"- {t['task']} (due {t['due']}, {t['status']})" for t in tasks
        ) or "No tasks assigned."
        sections.append(f"Your assigned tasks:\n{text}")

    return "\n\n".join(sections) or "No data is available for this role."


def _ask_gemini(prompt):
    """Try each configured model. Returns text, or None if all are unavailable."""
    now = time.time()
    for name in _model_names():
        if _exhausted_until.get(name, 0) > now:
            continue
        try:
            model = genai.GenerativeModel(name)
            response = model.generate_content(prompt, request_options={"timeout": 30})
            return response.text
        except gexc.TooManyRequests:
            logger.warning("Gemini quota reached for %s, trying next model", name)
            _exhausted_until[name] = now + COOLDOWN_SECONDS
        except (gexc.NotFound, gexc.InvalidArgument):
            logger.warning("Model %s is not usable, skipping it", name)
            _exhausted_until[name] = now + 24 * 60 * 60
        except Exception as exc:  # network error, blocked/empty response, etc.
            logger.warning("Gemini call failed for %s: %s", name, exc)
    return None


def _local_answer(question, user):
    """Answer from the database alone when the AI service is unavailable."""
    allowed = _allowed(user)
    q = question.lower()
    note = "(AI service is at its daily limit, so this is a summary straight from your data.)\n\n"

    if "risk" in q:
        if "risks" not in allowed:
            return DENIED
        risks = RiskAlert.objects.all()
        if not risks:
            return note + "No active risk alerts right now."
        lines = [f"• {r.project}: {r.risk} ({r.severity} severity)" for r in risks]
        return note + "Current project risks:\n" + "\n".join(lines)

    if "revenue" in q or "expense" in q or "financ" in q or "profit" in q:
        if "revenue" not in allowed:
            return DENIED
        rows = list(RevenueMonth.objects.all().order_by("id"))
        if not rows:
            return note + "No revenue data available yet."
        last = rows[-1]
        text = f"Latest month ({last.month}): revenue ₹{last.revenue}L, expenses ₹{last.expenses}L."
        if len(rows) > 1 and float(rows[-2].revenue):
            change = (float(last.revenue) - float(rows[-2].revenue)) / float(rows[-2].revenue) * 100
            direction = "up" if change >= 0 else "down"
            text += f" Revenue is {direction} {abs(change):.1f}% on {rows[-2].month}."
        first = rows[0]
        text += f" It has moved from ₹{first.revenue}L in {first.month} to ₹{last.revenue}L in {last.month}."
        return note + text

    if "productiv" in q or "team" in q:
        if "productivity" not in allowed:
            return DENIED
        teams = TeamProductivity.objects.all()
        lines = [f"• {p.team}: {p.completed} tasks completed, {p.pending} pending" for p in teams]
        return note + "Team productivity:\n" + "\n".join(lines)

    if _role_of(user) == "employee":
        tasks = _my_tasks(user)
        if not tasks:
            return note + "You have no tasks assigned."
        lines = [f"• {t['task']} (due {t['due']}, {t['status']})" for t in tasks]
        return note + "Your tasks:\n" + "\n".join(lines)

    if "kpis" in allowed:
        lines = [f"• {k.label}: {k.value} ({k.change})" for k in kpi_cards()]
        return note + "Current KPIs:\n" + "\n".join(lines)

    return DENIED


def ask_executive_assistant(question: str, user=None) -> str:
    role = _role_of(user)
    # Employees get personal data, so their cached answers are kept per user.
    scope = f"{role}:{getattr(user, 'pk', '')}" if role == "employee" else role
    key_text = " ".join(question.lower().split())
    cache_key = "chat:" + hashlib.md5(f"{scope}|{key_text}".encode()).hexdigest()

    cached = cache.get(cache_key)
    if cached:
        return cached

    context = build_business_context(user)
    prompt = f"""You are an executive assistant AI for a company dashboard.
The person asking has the role: {role}.
Answer using ONLY the business data below, which is everything this role is allowed to see.
Be concise, professional, and specific with numbers. If the data doesn't
cover the question, say so honestly instead of guessing. If the question is about
information that is not in the data below, tell them their role doesn't have access to it.
Reply in plain text only: no markdown, no asterisks, no headings.
Keep it short: at most 3 short sentences, or 4 short lines if listing items.

BUSINESS DATA:
{context}

QUESTION: {question}
"""

    text = _ask_gemini(prompt)
    if text:
        cache.set(cache_key, text, CACHE_SECONDS)
        return text

    return _local_answer(question, user)