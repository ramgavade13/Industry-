import os
import google.generativeai as genai
from finance.models import KPI, RevenueMonth
from risk.models import RiskAlert
from productivity.models import TeamProductivity

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-3.6-flash")


def build_business_context():
    """Pulls real data from the database to ground the AI's answer in facts."""
    kpis = KPI.objects.all()
    revenue = RevenueMonth.objects.all().order_by("id")
    risks = RiskAlert.objects.all()
    productivity = TeamProductivity.objects.all()

    kpi_text = "\n".join(f"- {k.label}: {k.value} ({k.change})" for k in kpis)
    revenue_text = "\n".join(f"- {r.month}: revenue ₹{r.revenue}L, expenses ₹{r.expenses}L" for r in revenue)
    risk_text = "\n".join(f"- {r.project}: {r.risk} ({r.severity} severity)" for r in risks) or "No active risks."
    productivity_text = "\n".join(f"- {p.team}: {p.completed}% completed, {p.pending}% pending" for p in productivity)

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


def ask_executive_assistant(question: str) -> str:
    context = build_business_context()

    prompt = f"""You are an executive assistant AI for a company dashboard.
Answer the CEO's question using ONLY the real business data below.
Be concise, professional, and specific with numbers. If the data doesn't
cover the question, say so honestly instead of guessing.

BUSINESS DATA:
{context}

QUESTION: {question}
"""

    response = model.generate_content(prompt)
    return response.text