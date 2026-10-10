"""
Turns raw project + task columns into the numeric features an ML model can
actually learn from. Shared between train_model.py and predict.py so both
always build features the exact same way.
"""

import os
import sys
import pandas as pd

sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data_processing"))
from preprocessing import load_projects, load_tasks, tasks_per_project  # noqa: E402

FEATURE_COLUMNS = [
    "budget_used_pct",
    "progress",
    "deadline_days",
    "delayed_tasks",
    "total_tasks",
    "completion_rate_pct",
]


def build_features(projects_df: pd.DataFrame = None, tasks_df: pd.DataFrame = None) -> pd.DataFrame:
    projects_df = projects_df if projects_df is not None else load_projects()
    tasks_df = tasks_df if tasks_df is not None else load_tasks()

    task_summary = tasks_per_project(tasks_df)
    df = projects_df.merge(task_summary, on="project_id", how="left")
    df[["total_tasks", "completed_tasks", "delayed_tasks", "completion_rate_pct"]] = df[
        ["total_tasks", "completed_tasks", "delayed_tasks", "completion_rate_pct"]
    ].fillna(0)

    keep = ["project_id", "project_name"] + FEATURE_COLUMNS
    return df[keep].reset_index(drop=True)


if __name__ == "__main__":
    features = build_features()
    print(features.to_string(index=False))