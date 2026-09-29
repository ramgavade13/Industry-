import numpy as np
from sklearn.ensemble import RandomForestClassifier


# Sample training data
# Features:
# 1. Progress percentage
# 2. Budget used percentage
# 3. Days remaining
# 4. Delayed tasks
# 5. Total tasks

X = np.array([
    [90, 60, 60, 0, 20],
    [80, 70, 45, 1, 20],
    [75, 65, 30, 2, 20],
    [60, 80, 20, 5, 20],
    [50, 90, 10, 8, 20],
    [40, 95, 5, 10, 20],
    [95, 50, 90, 0, 25],
    [85, 65, 50, 1, 25],
    [65, 75, 25, 4, 25],
    [45, 90, 8, 9, 25],
])

# Risk labels
# 0 = Low
# 1 = Medium
# 2 = High

y = np.array([
    0,
    0,
    1,
    1,
    2,
    2,
    0,
    0,
    1,
    2,
])


# Create model
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

# Train model
model.fit(X, y)


def predict_risk(
    progress_percentage: float,
    budget_used_percentage: float,
    days_remaining: int,
    delayed_tasks: int,
    total_tasks: int,
) -> str:

    project_data = np.array([[
        progress_percentage,
        budget_used_percentage,
        days_remaining,
        delayed_tasks,
        total_tasks,
    ]])

    prediction = model.predict(project_data)[0]

    risk_levels = {
        0: "Low",
        1: "Medium",
        2: "High",
    }

    return risk_levels[prediction]


if __name__ == "__main__":

    risk = predict_risk(
        progress_percentage=55,
        budget_used_percentage=85,
        days_remaining=12,
        delayed_tasks=6,
        total_tasks=20,
    )

    print(f"Predicted Project Risk: {risk}")