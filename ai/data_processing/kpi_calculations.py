"""
KPI formulas matching the SRS (Section FR-05 / Sample KPIs).
Each function takes a cleaned DataFrame (from preprocessing.py) and returns
a simple value or a small DataFrame -- these are what the backend's
/api/kpis/ endpoint will eventually call.
"""

import pandas as pd


def revenue_growth(financials_df: pd.DataFrame) -> pd.DataFrame:
    """(Current Revenue - Previous Revenue) / Previous Revenue * 100, per month."""
    df = financials_df.sort_values("month").copy()
    df["revenue_growth_pct"] = (df["revenue"].pct_change() * 100).round(1)
    return df[["month", "revenue", "revenue_growth_pct"]]


def profit_margin(financials_df: pd.DataFrame) -> pd.DataFrame:
    """Profit / Revenue * 100, per month."""
    df = financials_df.copy()
    df["profit_margin_pct"] = (df["profit"] / df["revenue"] * 100).round(1)
    return df[["month", "profit", "revenue", "profit_margin_pct"]]


def expense_growth(financials_df: pd.DataFrame) -> pd.DataFrame:
    """(Current Expenses - Previous Expenses) / Previous Expenses * 100, per month."""
    df = financials_df.sort_values("month").copy()
    df["expense_growth_pct"] = (df["expenses"].pct_change() * 100).round(1)
    return df[["month", "expenses", "expense_growth_pct"]]


def project_completion(projects_df: pd.DataFrame) -> pd.DataFrame:
    """Progress % is already the completion metric per project; this adds a company-wide average."""
    out = projects_df[["project_id", "project_name", "progress"]].rename(columns={"progress": "completion_pct"})
    return out


def task_completion_rate(tasks_summary_df: pd.DataFrame) -> pd.DataFrame:
    """Completed Tasks / Total Tasks * 100, per project. Expects output of tasks_per_project()."""
    return tasks_summary_df[["project_id", "total_tasks", "completed_tasks", "completion_rate_pct"]]


def budget_variance(projects_df: pd.DataFrame) -> pd.DataFrame:
    """Difference between actual and planned (budgeted) cost, in currency and percent."""
    df = projects_df.copy()
    df["budget_variance"] = df["actual_cost"] - df["budget"]
    df["budget_variance_pct"] = (df["budget_variance"] / df["budget"] * 100).round(1)
    return df[["project_id", "project_name", "budget", "actual_cost", "budget_variance", "budget_variance_pct"]]


def employee_productivity(tasks_df: pd.DataFrame, working_days: int = 10) -> pd.DataFrame:
    """Completed Tasks / Working Days, per employee."""
    completed = tasks_df[tasks_df["status"] == "Completed"]
    out = (
        completed.groupby(["employee_id", "employee_name"])
        .size()
        .reset_index(name="completed_tasks")
    )
    out["productivity"] = (out["completed_tasks"] / working_days).round(2)
    return out.sort_values("productivity", ascending=False).reset_index(drop=True)


def company_kpi_summary(financials_df: pd.DataFrame, projects_df: pd.DataFrame, tasks_summary_df: pd.DataFrame) -> dict:
    """One flat dict of the latest headline numbers -- handy for a dashboard 'overview' card."""
    latest = financials_df.sort_values("month").iloc[-1]
    rev_growth = revenue_growth(financials_df)
    return {
        "revenue": float(latest["revenue"]),
        "profit": float(latest["profit"]),
        "profit_margin_pct": round(float(latest["profit"] / latest["revenue"] * 100), 1),
        "revenue_growth_pct": float(rev_growth.iloc[-1]["revenue_growth_pct"]) if len(rev_growth) > 1 else None,
        "avg_project_completion_pct": round(float(projects_df["progress"].mean()), 1),
        "avg_task_completion_rate_pct": round(float(tasks_summary_df["completion_rate_pct"].mean()), 1),
        "total_active_projects": int(len(projects_df)),
    }


if __name__ == "__main__":
    from preprocessing import load_financials, load_projects, load_tasks, tasks_per_project

    financials = load_financials()
    projects = load_projects()
    tasks = load_tasks()
    tasks_summary = tasks_per_project(tasks)

    print("Revenue growth:\n", revenue_growth(financials).tail(3))
    print("\nBudget variance (top 5 overspend):\n", budget_variance(projects).sort_values("budget_variance_pct", ascending=False).head())
    print("\nTop 5 most productive employees:\n", employee_productivity(tasks).head())
    print("\nCompany KPI summary:\n", company_kpi_summary(financials, projects, tasks_summary))