"""
Trains a real ML classifier (RandomForest) to predict project risk level,
replacing the fixed if/else thresholds in predict.py.

Bootstrapping note: there's no history of REAL outcomes yet (did a project
actually finish late?), so this trains on labels derived from the SAME
rule thresholds predict.py uses. That's a deliberate first step -- it
builds the full pipeline (features -> train -> save -> load -> predict)
ready to retrain later on genuine outcome data.
"""

import os
import sys
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from features import build_features, FEATURE_COLUMNS  # noqa: E402

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models", "risk_model.pkl"
)


def derive_bootstrap_labels(features_df: pd.DataFrame) -> pd.Series:
    budget_risk = (features_df["budget_used_pct"] > 85) & (features_df["progress"] < 75)
    deadline_risk = (features_df["deadline_days"] < 10) & (features_df["progress"] < 60)
    task_risk = features_df["delayed_tasks"] >= 2

    flags = budget_risk.astype(int) + deadline_risk.astype(int) + task_risk.astype(int)
    return flags.map(lambda f: "High" if f >= 2 else ("Medium" if f == 1 else "Low"))


def train():
    features_df = build_features()
    labels = derive_bootstrap_labels(features_df)

    X = features_df[FEATURE_COLUMNS]
    y = labels

    if len(X) >= 10 and y.nunique() > 1:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.3, random_state=42, stratify=y
        )
    else:
        X_train, X_test, y_train, y_test = X, X, y, y

    model = RandomForestClassifier(n_estimators=200, max_depth=5, random_state=42)
    model.fit(X_train, y_train)

    print("Evaluation on held-out rows:")
    print(classification_report(y_test, model.predict(X_test), zero_division=0))

    importances = pd.Series(model.feature_importances_, index=FEATURE_COLUMNS).sort_values(ascending=False)
    print("Feature importance (which signals the model relies on most):")
    print(importances.round(3).to_string())

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"\nSaved model to {MODEL_PATH}")


if __name__ == "__main__":
    train()