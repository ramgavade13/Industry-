import os
import pandas as pd
from sklearn.ensemble import RandomForestClassifier


# Get the project root directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Path to training dataset
DATA_PATH = os.path.join(
    BASE_DIR,
    "data",
    "projects.csv"
)


# Load training dataset
data = pd.read_csv(DATA_PATH)


# Features used by the model
FEATURES = [
    "progress_percentage",
    "budget_used_percentage",
    "days_remaining",
    "delayed_tasks",
    "total_tasks",
]


# Input features
X = data[FEATURES]

# Target/output
y = data["risk"]


# Create Random Forest model
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)


# Train the model
model.fit(X, y)


def predict_risk(
    progress_percentage: float,
    budget_used_percentage: float,
    days_remaining: int,
    delayed_tasks: int,
    total_tasks: int,
) -> str:

    project_data = pd.DataFrame([{
        "progress_percentage": progress_percentage,
        "budget_used_percentage": budget_used_percentage,
        "days_remaining": days_remaining,
        "delayed_tasks": delayed_tasks,
        "total_tasks": total_tasks,
    }])

    prediction = model.predict(project_data)[0]

    return prediction


if __name__ == "__main__":

    risk = predict_risk(
        progress_percentage=55,
        budget_used_percentage=85,
        days_remaining=12,
        delayed_tasks=6,
        total_tasks=20,
    )

    print(f"Predicted Project Risk: {risk}")