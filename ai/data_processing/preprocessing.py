"""
Shared data loading + cleaning functions.
Every other AI module (risk_prediction, forecasting, agents) should import
from here instead of reading CSVs directly, so cleaning rules stay in one
place. Once the Django backend is ready, swap load_projects()/load_tasks()
to query the database instead of reading CSVs -- everything downstream
keeps working unchanged because the returned DataFrame shape stays the same.
"""

import os
import pandas as pd

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")


def load_projects(path: str = None) -> pd.DataFrame:
    """Load and clean the projects dataset."""
    path = path or os.path.join(DATA_DIR, "projects.csv")
    df = pd.read_csv(path)

    required = {"project_id", "project_name", "budget", "actual_cost", "progress", "deadline_days"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"projects.csv is missing columns: {missing}")

    # basic cleaning
    df["budget"] = pd.to_numeric(df["budget"], errors="coerce")
    df["actual_cost"] = pd.to_numeric(df["actual_cost"], errors="coerce")
    df["progress"] = pd.to_numeric(df["progress"], errors="coerce").clip(0, 100)
    df["deadline_days"] = pd.to_numeric(df["deadline_days"], errors="coerce")
    df = df.dropna(subset=["budget", "actual_cost", "progress", "deadline_days"])

    df["budget_used_pct"] = (df["actual_cost"] / df["budget"] * 100).round(1)
    return df.reset_index(drop=True)


def load_tasks(path: str = None) -> pd.DataFrame:
    """Load and clean the tasks dataset."""
    path = path or os.path.join(DATA_DIR, "tasks.csv")
    df = pd.read_csv(path)

    required = {"task_id", "project_id", "employee_id", "status", "due_days"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"tasks.csv is missing columns: {missing}")

    df["status"] = df["status"].str.strip().str.title()
    df["due_days"] = pd.to_numeric(df["due_days"], errors="coerce")
    df = df.dropna(subset=["due_days"])
    df["is_delayed"] = (df["status"] == "Delayed") | ((df["due_days"] < 0) & (df["status"] != "Completed"))
    return df.reset_index(drop=True)


def load_financials(path: str = None) -> pd.DataFrame:
    """Load and clean the monthly financials dataset."""
    path = path or os.path.join(DATA_DIR, "financials.csv")
    df = pd.read_csv(path)
    df["month"] = pd.to_datetime(df["month"], format="%Y-%m")
    for col in ("revenue", "expenses", "profit"):
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df = df.dropna().sort_values("month").reset_index(drop=True)
    return df


def load_kpi_history(path: str = None) -> pd.DataFrame:
    """Load and clean the monthly KPI history dataset."""
    path = path or os.path.join(DATA_DIR, "kpi_history.csv")
    df = pd.read_csv(path)
    df["month"] = pd.to_datetime(df["month"], format="%Y-%m")
    numeric_cols = [c for c in df.columns if c != "month"]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df = df.dropna().sort_values("month").reset_index(drop=True)
    return df


def tasks_per_project(tasks_df: pd.DataFrame) -> pd.DataFrame:
    """Summarize task counts and delay counts per project_id."""
    summary = (
        tasks_df.groupby("project_id")
        .agg(
            total_tasks=("task_id", "count"),
            completed_tasks=("status", lambda s: (s == "Completed").sum()),
            delayed_tasks=("is_delayed", "sum"),
        )
        .reset_index()
    )
    summary["completion_rate_pct"] = (summary["completed_tasks"] / summary["total_tasks"] * 100).round(1)
    return summary


if __name__ == "__main__":
    # Quick manual check: run `python preprocessing.py` from this folder
    projects = load_projects()
    tasks = load_tasks()
    print(f"Loaded {len(projects)} projects, {len(tasks)} tasks")
    print(tasks_per_project(tasks))