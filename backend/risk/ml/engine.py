"""
Project risk prediction (FR-09), based on Pranav's risk_prediction module.

Reads project and task data (CSV files in the ./data folder), builds the same 6
features Pranav's model uses, trains a RandomForest classifier and predicts a
Low / Medium / High risk level plus a 0-100 risk score for every project.

NOTE: there are no real "did the project finish late?" outcomes yet, so the
training labels are derived from the same rule thresholds as Pranav's
train_model.py. The model is therefore a first, working pipeline that can be
retrained later on real outcome data.

The model is trained here (not copied from a .pkl file) so it always matches
the scikit-learn version installed in this backend.
"""

import csv
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
MODEL_PATH = BASE_DIR / "risk_model.joblib"

FEATURES = [
    "budget_used_pct",
    "progress",
    "deadline_days",
    "delayed_tasks",
    "total_tasks",
    "completion_rate_pct",
]


# ---------- data loading ----------

def _read_csv(name):
    with open(DATA_DIR / name, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def load_project_rows():
    """One dict per project with the 6 model features."""
    projects = _read_csv("projects.csv")
    tasks = _read_csv("tasks.csv")

    summary = {}
    for t in tasks:
        pid = t["project_id"].strip()
        status = t["status"].strip().title()
        due = float(t["due_days"])
        delayed = status == "Delayed" or (due < 0 and status != "Completed")
        s = summary.setdefault(pid, {"total": 0, "completed": 0, "delayed": 0})
        s["total"] += 1
        s["completed"] += 1 if status == "Completed" else 0
        s["delayed"] += 1 if delayed else 0

    rows = []
    for p in projects:
        pid = p["project_id"].strip()
        budget = float(p["budget"])
        cost = float(p["actual_cost"])
        s = summary.get(pid, {"total": 0, "completed": 0, "delayed": 0})
        rows.append({
            "project_id": pid,
            "project_name": p["project_name"].strip(),
            "budget_used_pct": round(cost / budget * 100, 1) if budget else 0.0,
            "progress": min(max(float(p["progress"]), 0.0), 100.0),
            "deadline_days": float(p["deadline_days"]),
            "delayed_tasks": float(s["delayed"]),
            "total_tasks": float(s["total"]),
            "completion_rate_pct": round(s["completed"] / s["total"] * 100, 1) if s["total"] else 0.0,
        })
    return rows


# ---------- rule thresholds (same as Pranav's predict.py) ----------

def _flags(row):
    return {
        "budget": row["budget_used_pct"] > 85 and row["progress"] < 75,
        "deadline": row["deadline_days"] < 10 and row["progress"] < 60,
        "tasks": row["delayed_tasks"] >= 2,
    }


def rule_level(row):
    n = sum(_flags(row).values())
    return "High" if n >= 2 else ("Medium" if n == 1 else "Low")


def rule_reason(row):
    f = _flags(row)
    reasons = []
    if f["budget"]:
        reasons.append(f"used {row['budget_used_pct']:g}% of budget at only {row['progress']:g}% complete")
    if f["deadline"]:
        reasons.append(f"only {row['deadline_days']:g} days left with {row['progress']:g}% complete")
    if f["tasks"]:
        reasons.append(f"{int(row['delayed_tasks'])} delayed task(s)")
    return "; ".join(reasons)


# ---------- model ----------

def _matrix(rows):
    return np.array([[r[c] for c in FEATURES] for r in rows], dtype=float)


def train_model(rows):
    X = _matrix(rows)
    y = np.array([rule_level(r) for r in rows])
    model = RandomForestClassifier(n_estimators=200, max_depth=5, random_state=42)
    model.fit(X, y)
    joblib.dump(model, MODEL_PATH)
    return model


def load_or_train(rows, retrain=False):
    if not retrain and MODEL_PATH.exists():
        try:
            model = joblib.load(MODEL_PATH)
            if getattr(model, "n_features_in_", None) == len(FEATURES):
                return model
        except Exception:
            pass  # unreadable or from another library version -> retrain below
    return train_model(rows)


def analyze_projects(retrain=False):
    """Return one dict per project, highest risk first."""
    rows = load_project_rows()
    model = load_or_train(rows, retrain=retrain)

    X = _matrix(rows)
    levels = model.predict(X)
    proba = model.predict_proba(X)
    classes = list(model.classes_)

    results = []
    for row, level, p in zip(rows, levels, proba):
        by_class = dict(zip(classes, p))
        score = 100 * (by_class.get("High", 0.0) + 0.5 * by_class.get("Medium", 0.0))
        results.append({
            "project_id": row["project_id"],
            "project_name": row["project_name"],
            "risk_level": str(level),
            "score": round(float(score), 1),
            "reason": rule_reason(row) or "Flagged by the risk model from combined signals.",
        })
    results.sort(key=lambda r: r["score"], reverse=True)
    return results


if __name__ == "__main__":
    for r in analyze_projects():
        print(f"[{r['risk_level']:<6}] {r['score']:>5}  {r['project_name']}  ->  {r['reason']}")