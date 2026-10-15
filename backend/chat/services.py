import os
import time
import hashlib
import logging

import google.generativeai as genai
from django.core.cache import cache
from google.api_core import exceptions as gexc

from finance.models import KPI, RevenueMonth
from risk.models import RiskAlert
from productivity.models import TeamProductivity

logger = logging.getLogger(__name__)

# REST transport avoids the gRPC hangs seen on some Windows networks.
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"), transport="rest")

# Each Gemini model has its own free daily quota, so we try them in order.
# Set GEMINI_MODELS in .env as a comma-separated list.
DEFAULT_MODELS = ["gemini-3.6-flash"]
COOLDOWN_SECONDS = 30 * 60   # skip a model for 30 min after it hits its quota
CACHE_SECONDS = 5 * 60       # reuse the same answer for 5 minutes

_exhausted_until = {}


def _model_names():
    raw = os.environ.get("GEMINI_MODELS", "")
    names = [m.strip() for m in raw.split(",") if m.strip()]
    return names or DEFAULT_MODELS


def build_business_context():
    """Pulls real data from the database to ground the AI's answer in facts."""
    kpis = KPI.objects.all()
    revenue = RevenueMonth.objects.all().order_by("id")
    risks = RiskAlert.objects.all()
    productivity = TeamProductivity.objects.all()

    kpi_text = "\n".join(f"- {k.label}: {k.value} ({k.change})" for k in kpis)
    revenue_text = "\n".join(
        f"- {r.month}: revenue ₹{r.revenue}L, expenses ₹{r.expenses}L" for r in revenue
    )
    risk_text = "\n".join(
        f"- {r.project}: {r.risk} ({r.severity} severity)" for r in risks
    ) or "No active risks."
    productivity_text = "\n".join(
        f"- {p.team}: {p.completed}% completed, {p.pending}% pending" for p in productivity
    )

    return f"""
KPIs:
{kpi_text}

Revenue trend:
{revenue_text}

Risk alerts:
{risk_text}

Team productivity:
{productivity_text}
"""


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


def _local_answer(question):
    """Answer from the database alone when the AI service is unavailable."""
    q = question.lower()
    note = "(AI service is at its daily limit, so this is a summary straight from your data.)\n\n"

    if "risk" in q:
        risks = RiskAlert.objects.all()
        if not risks:
            return note + "No active risk alerts right now."
        lines = [f"• {r.project}: {r.risk} ({r.severity} severity)" for r in risks]
        return note + "Current project risks:\n" + "\n".join(lines)

    if "revenue" in q or "expense" in q or "financ" in q or "profit" in q:
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
        teams = TeamProductivity.objects.all()
        lines = [f"• {p.team}: {p.completed}% completed, {p.pending}% pending" for p in teams]
        return note + "Team productivity:\n" + "\n".join(lines)

    kpis = KPI.objects.all()
    lines = [f"• {k.label}: {k.value} ({k.change})" for k in kpis]
    return note + "Current KPIs:\n" + "\n".join(lines)


def ask_executive_assistant(question: str) -> str:
    cache_key = "chat:" + hashlib.md5(" ".join(question.lower().split()).encode()).hexdigest()
    cached = cache.get(cache_key)
    if cached:
        return cached

    context = build_business_context()
    prompt = f"""You are an executive assistant AI for a company dashboard.
Answer the CEO's question using ONLY the real business data below.
Be concise, professional, and specific with numbers. If the data doesn't
cover the question, say so honestly instead of guessing.
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

    return _local_answer(question)