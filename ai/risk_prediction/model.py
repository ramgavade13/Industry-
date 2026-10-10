import os
import pandas as pd
from sklearn.ensemble import RandomForestClassifier


# Get the project root directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Path to project dataset
DATA_PATH = os.path.join(
    BASE_DIR,
    "data",
    "projects.csv"
)

# Features used by the model
FEATURES = [
    "progress_percentage",
    "budget_used_percentage",
    "days_remaining",
    "delayed_tasks",
    "total_tasks",
]


def load_training_data():
    """
    Load the project data and prepare features for risk prediction.
    """

    data = pd.read_csv(DATA_PATH)

    # Convert existing project columns into model features
    data["progress_percentage"] = data["progress"]

    data["budget_used_percentage"] = (
        data["actual_cost"] / data["budget"]
    ) * 100

    data["days_remaining"] = data["deadline_days"]

    # The projects dataset does not contain task-level information.
    # Use zero as a placeholder until task data is integrated.
    data["delayed_tasks"] = 0
    data["total_tasks"] = 0

    # Create risk labels using simple business rules.
    # These are provisional labels, not verified historical outcomes.
    def determine_risk(row):
        if (
            row["budget_used_percentage"] > 100
            or (
                row["days_remaining"] <= 14
                and row["progress_percentage"] < 80
            )
        ):
            return "High"

        elif (
            row["budget_used_percentage"] >= 85
            or (
                row["days_remaining"] <= 30
                and row["progress_percentage"] < 70
            )
        ):
            return "Medium"

        else:
            return "Low"

    data["risk"] = data.apply(determine_risk, axis=1)

    X = data[FEATURES]
    y = data["risk"]

    return X, y


def train_model():
    """
    Train the Random Forest model.
    """

    X, y = load_training_data()

    model = RandomForestClassifier(
        n_estimators=100,
        random_state=42
    )

    model.fit(X, y)

    return model


# Train the model when this module is imported.
# Training now uses the actual columns in projects.csv.
model = train_model()


def predict_risk(
    progress_percentage: float,
    budget_used_percentage: float,
    days_remaining: int,
    delayed_tasks: int,
    total_tasks: int,
) -> str:
    """
    Predict project risk using the trained Random Forest model.
    """

    project_data = pd.DataFrame([{
        "progress_percentage": progress_percentage,
        "budget_used_percentage": budget_used_percentage,
        "days_remaining": days_remaining,
        "delayed_tasks": delayed_tasks,
        "total_tasks": total_tasks,
    }])

    prediction = model.predict(project_data)[0]

    return str(prediction)


if __name__ == "__main__":

    risk = predict_risk(
        progress_percentage=55,
        budget_used_percentage=85,
        days_remaining=12,
        delayed_tasks=6,
        total_tasks=20,
    )

    print(f"Predicted Project Risk: {risk}")