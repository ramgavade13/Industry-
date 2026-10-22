
"""
Employee Productivity Analysis Agent

Responsibilities:
1. Read task data from tasks.csv.
2. Calculate task completion statistics.
3. Summarize productivity by employee.
4. Identify overdue and delayed tasks.
5. Generate productivity recommendations.
"""

from pathlib import Path
import sys

import pandas as pd


# Locate the project directory.
AI_DIR = Path(__file__).resolve().parents[1]

if str(AI_DIR) not in sys.path:
    sys.path.insert(0, str(AI_DIR))

DATA_DIR = AI_DIR / "data"


def load_task_data():
    """Load and standardize task information."""

    tasks_file = DATA_DIR / "tasks.csv"

    if not tasks_file.exists():
        raise FileNotFoundError(
            f"Task data file not found: {tasks_file}"
        )

    tasks = pd.read_csv(tasks_file)

    tasks.columns = [
        str(column).strip().lower().replace(" ", "_")
        for column in tasks.columns
    ]

    return tasks


def find_column(data, possible_names):
    """Find the first matching column name."""

    for name in possible_names:
        if name in data.columns:
            return name

    return None


def analyze_productivity():
    """Analyze task completion, delays, and employee workloads."""

    tasks = load_task_data()

    if tasks.empty:
        return {
            "status": "no_data",
            "message": "The tasks.csv file contains no task records.",
            "total_tasks": 0,
            "completed_tasks": 0,
            "incomplete_tasks": 0,
            "overdue_tasks": 0,
            "delayed_tasks": 0,
            "completion_rate_percent": 0.0,
            "employees": [],
            "recommendations": [],
        }

    employee_column = find_column(
        tasks,
        [
            "employee_name",
            "employee",
            "assigned_to",
            "assignee",
            "team_member",
            "owner",
        ],
    )

    status_column = find_column(
        tasks,
        [
            "status",
            "task_status",
            "completion_status",
        ],
    )

    # Your dataset uses due_days.
    due_days_column = find_column(
        tasks,
        [
            "due_days",
            "days_until_due",
            "days_to_deadline",
            "remaining_days",
        ],
    )

    # These columns are supported if your dataset uses actual dates.
    deadline_column = find_column(
        tasks,
        [
            "deadline",
            "due_date",
            "target_date",
        ],
    )

    if employee_column is None:
        return {
            "status": "error",
            "message": "Could not identify the employee column.",
            "total_tasks": len(tasks),
            "employees": [],
            "recommendations": [
                "Check the employee_name column in tasks.csv."
            ],
        }

    if status_column is not None:
        tasks["_normalized_status"] = (
            tasks[status_column]
            .fillna("")
            .astype(str)
            .str.strip()
            .str.lower()
        )
    else:
        tasks["_normalized_status"] = ""

    completed_values = {
        "completed",
        "complete",
        "done",
        "finished",
        "closed",
    }

    tasks["_is_completed"] = (
        tasks["_normalized_status"].isin(completed_values)
    )

    # Identify tasks explicitly marked as delayed.
    tasks["_is_delayed"] = (
        tasks["_normalized_status"].isin(
            {"delayed", "overdue", "late"}
        )
    )

    # Identify overdue tasks using due_days when available.
    if due_days_column is not None:
        tasks["_due_days_numeric"] = pd.to_numeric(
            tasks[due_days_column],
            errors="coerce",
        )

        tasks["_is_overdue"] = (
            tasks["_due_days_numeric"].lt(0)
            & tasks["_due_days_numeric"].notna()
            & ~tasks["_is_completed"]
        )

        overdue_method = "due_days"

    elif deadline_column is not None:
        tasks["_parsed_deadline"] = pd.to_datetime(
            tasks[deadline_column],
            errors="coerce",
            utc=True,
        )

        now = pd.Timestamp.now(tz="UTC")

        tasks["_is_overdue"] = (
            tasks["_parsed_deadline"].notna()
            & (tasks["_parsed_deadline"] < now)
            & ~tasks["_is_completed"]
        )

        overdue_method = "deadline"

    else:
        tasks["_is_overdue"] = False
        overdue_method = None

    employee_results = []

    for employee, employee_tasks in tasks.groupby(
        employee_column,
        dropna=False,
    ):
        total = len(employee_tasks)

        completed = int(
            employee_tasks["_is_completed"].sum()
        )

        overdue = int(
            employee_tasks["_is_overdue"].sum()
        )

        delayed = int(
            employee_tasks["_is_delayed"].sum()
        )

        completion_rate = (
            round((completed / total) * 100, 2)
            if total > 0
            else 0.0
        )

        employee_name = (
            str(employee)
            if pd.notna(employee)
            else "Unassigned"
        )

        employee_results.append(
            {
                "employee": employee_name,
                "total_tasks": total,
                "completed_tasks": completed,
                "incomplete_tasks": total - completed,
                "overdue_tasks": overdue,
                "delayed_tasks": delayed,
                "completion_rate_percent": completion_rate,
            }
        )

    total_tasks = len(tasks)
    completed_tasks = int(tasks["_is_completed"].sum())
    overdue_tasks = int(tasks["_is_overdue"].sum())
    delayed_tasks = int(tasks["_is_delayed"].sum())

    recommendations = []

    if status_column is None:
        recommendations.append(
            "No task status column was found. "
            "Completion rates cannot be reliably evaluated."
        )

    if overdue_method is None:
        recommendations.append(
            "No recognized deadline or due_days column was found. "
            "Overdue tasks could not be evaluated."
        )

    if overdue_tasks > 0:
        recommendations.append(
            f"{overdue_tasks} incomplete task(s) are overdue. "
            "Review their blockers, priorities, and revised deadlines."
        )

    if delayed_tasks > 0:
        recommendations.append(
            f"{delayed_tasks} task(s) are marked Delayed, Overdue, "
            "or Late. Follow up with the responsible employees."
        )

    for employee in employee_results:
        if employee["overdue_tasks"] > 0:
            recommendations.append(
                f"Review {employee['overdue_tasks']} overdue task(s) "
                f"assigned to {employee['employee']}."
            )

        if (
            employee["total_tasks"] >= 3
            and employee["completion_rate_percent"] < 50
        ):
            recommendations.append(
                f"Review blockers and workload for "
                f"{employee['employee']}; fewer than half of their "
                "recorded tasks are marked completed."
            )

    if not recommendations:
        recommendations.append(
            "Continue monitoring task completion, deadlines, "
            "and employee workloads."
        )

    return {
        "status": "success",
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "incomplete_tasks": total_tasks - completed_tasks,
        "overdue_tasks": overdue_tasks,
        "delayed_tasks": delayed_tasks,
        "overdue_detection_method": overdue_method,
        "completion_rate_percent": round(
            (completed_tasks / total_tasks) * 100,
            2,
        ),
        "employees": employee_results,
        "recommendations": recommendations,
    }


def get_productivity_report():
    """Return the productivity report."""

    return analyze_productivity()


if __name__ == "__main__":
    import json

    report = get_productivity_report()

    print("\n=== EMPLOYEE PRODUCTIVITY ANALYSIS ===\n")
    print(json.dumps(report, indent=2, default=str))
