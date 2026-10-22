"""
Project risk detection. Two ways to get a risk level, same shape of output:

  find_risky_projects()        -- rule-based thresholds, always available,
                                   easy to explain in a demo
  find_risky_projects_ml()     -- uses the RandomForest model saved by
                                   train_model.py, if it exists; otherwise
                                   automatically falls back to the rules
"""

import os
import sys
import pandas as pd

sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data_processing"))
from preprocessing import load_projects, load_tasks, tasks_per_project  # noqa: E402
from risk_prediction.features import build_features, FEATURE_COLUMNS
MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models", "risk_model.pkl"
)


def find_risky_projects(projects_df: pd.DataFrame = None, tasks_df: pd.DataFrame = None) -> pd.DataFrame:
    projects_df = projects_df if projects_df is not None else load_projects()
    tasks_df = tasks_df if tasks_df is not None else load_tasks()

    df = projects_df.copy()
    task_summary = tasks_per_project(tasks_df)
    df = df.merge(task_summary, on="project_id", how="left").fillna({"delayed_tasks": 0, "total_tasks": 0, "completion_rate_pct": 0})

    df["budget_risk"] = (df["budget_used_pct"] > 85) & (df["progress"] < 75)
    df["deadline_risk"] = (df["deadline_days"] < 10) & (df["progress"] < 60)
    df["task_risk"] = df["delayed_tasks"] >= 2
    df["is_risky"] = df["budget_risk"] | df["deadline_risk"] | df["task_risk"]

    def risk_level(row):
        flags = sum([row["budget_risk"], row["deadline_risk"], row["task_risk"]])
        if flags >= 2:
            return "High"
        if flags == 1:
            return "Medium"
        return "Low"

    def risk_reason(row):
        reasons = []
        if row["budget_risk"]:
            reasons.append(f"used {row['budget_used_pct']}% of budget at only {row['progress']}% complete")
        if row["deadline_risk"]:
            reasons.append(f"only {row['deadline_days']} days left with {row['progress']}% complete")
        if row["task_risk"]:
            reasons.append(f"{int(row['delayed_tasks'])} delayed task(s)")
        return "; ".join(reasons)

    df["risk_level"] = df.apply(risk_level, axis=1)
    df["risk_reason"] = df.apply(risk_reason, axis=1)

    risky = df[df["is_risky"]].sort_values("risk_level", ascending=False)
    cols = [
        "project_id", "project_name", "budget_used_pct", "progress", "deadline_days",
        "delayed_tasks", "risk_level", "risk_reason",
    ]
    return risky[cols].reset_index(drop=True)


def find_risky_projects_ml(projects_df: pd.DataFrame = None, tasks_df: pd.DataFrame = None) -> pd.DataFrame:
    if not os.path.exists(MODEL_PATH):
        print("No trained model found yet -- run train_model.py first. Using rules instead.")
        return find_risky_projects(projects_df, tasks_df)

    import joblib

    model = joblib.load(MODEL_PATH)
    features_df = build_features(projects_df, tasks_df)

    predictions = model.predict(features_df[FEATURE_COLUMNS])
    features_df["risk_level"] = predictions

    rules_df = find_risky_projects(projects_df, tasks_df)[["project_id", "risk_reason"]]
    merged = features_df.merge(rules_df, on="project_id", how="left")
    merged["risk_reason"] = merged["risk_reason"].fillna("Flagged by risk model based on combined signals.")

    risky = merged[merged["risk_level"] != "Low"].sort_values("risk_level", ascending=False)
    cols = [
        "project_id", "project_name", "budget_used_pct", "progress", "deadline_days",
        "delayed_tasks", "risk_level", "risk_reason",
    ]
    return risky[cols].reset_index(drop=True)


if __name__ == "__main__":
    print("=== Rule-based ===")
    risky = find_risky_projects()
    print(f"Found {len(risky)} risky project(s):\n")
    for _, row in risky.iterrows():
        print(f"[{row['risk_level']}] {row['project_name']} -> {row['risk_reason']}")

    print("\n=== ML model (falls back to rules if not trained yet) ===")
    risky_ml = find_risky_projects_ml()
    print(f"Found {len(risky_ml)} risky project(s):\n")
    for _, row in risky_ml.iterrows():
        print(f"[{row['risk_level']}] {row['project_name']} -> {row['risk_reason']}")