
"""
Project Risk Analysis Agent

Responsibilities:
1. Identify project risks.
2. Use the existing ML risk prediction module.
3. Return structured project risk information.
4. Provide recommendations for risky projects.
"""

from pathlib import Path
import sys

import pandas as pd

# Locate the main AI project directory.
AI_DIR = Path(__file__).resolve().parents[1]

# Make the project directory available for imports.
if str(AI_DIR) not in sys.path:
    sys.path.insert(0, str(AI_DIR))

from risk_prediction.predict import find_risky_projects_ml


def analyze_project_risks():
    """
    Analyze project risks using the existing prediction module.

    Returns:
        dict: Structured risk analysis and recommendations.
    """

    try:
        predictions = find_risky_projects_ml()

        if predictions is None:
            return {
                "status": "no_data",
                "message": "No project risk predictions were returned.",
                "total_projects_analyzed": 0,
                "high_risk_projects": 0,
                "medium_risk_projects": 0,
                "low_risk_projects": 0,
                "projects": [],
                "recommendations": [],
            }

        # Convert prediction results into a list of dictionaries.
        if isinstance(predictions, pd.DataFrame):
            projects = predictions.to_dict(orient="records")

        elif isinstance(predictions, list):
            projects = predictions

        elif isinstance(predictions, dict):
            projects = predictions.get(
                "projects",
                predictions.get("predictions", []),
            )

            if isinstance(projects, dict):
                projects = [projects]

            if not isinstance(projects, list):
                projects = []

        else:
            return {
                "status": "error",
                "message": "Unsupported prediction result format.",
                "total_projects_analyzed": 0,
                "high_risk_projects": 0,
                "medium_risk_projects": 0,
                "low_risk_projects": 0,
                "projects": [],
                "recommendations": [],
            }

        # Count project risk levels.
        high_risk_count = 0
        medium_risk_count = 0
        low_risk_count = 0

        for project in projects:
            if not isinstance(project, dict):
                continue

            risk_value = project.get(
                "risk_level",
                project.get(
                    "risk",
                    project.get("predicted_risk", "unknown"),
                ),
            )

            risk_level = str(risk_value).strip().lower()

            if risk_level in {"high", "high risk", "critical"}:
                high_risk_count += 1

            elif risk_level in {
                "medium",
                "medium risk",
                "moderate",
            }:
                medium_risk_count += 1

            elif risk_level in {"low", "low risk"}:
                low_risk_count += 1

        # Generate recommendations.
        recommendations = []

        if high_risk_count:
            recommendations.append(
                f"{high_risk_count} project(s) have high or critical risk. "
                "Review budgets, deadlines, delayed tasks, and blockers "
                "immediately."
            )

        if medium_risk_count:
            recommendations.append(
                f"{medium_risk_count} project(s) have medium risk. "
                "Monitor progress, budgets, deadlines, and unresolved issues."
            )

        if low_risk_count:
            recommendations.append(
                f"{low_risk_count} project(s) have low risk. "
                "Continue routine monitoring."
            )

        if not recommendations:
            recommendations.append(
                "No recognized risk classifications were found. "
                "Check the prediction output and continue monitoring."
            )

        return {
            "status": "success",
            "total_projects_analyzed": len(projects),
            "high_risk_projects": high_risk_count,
            "medium_risk_projects": medium_risk_count,
            "low_risk_projects": low_risk_count,
            "projects": projects,
            "recommendations": recommendations,
        }

    except FileNotFoundError as error:
        return {
            "status": "error",
            "message": f"Required project data or model is missing: {error}",
            "total_projects_analyzed": 0,
            "high_risk_projects": 0,
            "medium_risk_projects": 0,
            "low_risk_projects": 0,
            "projects": [],
            "recommendations": [
                "Check the project CSV files and risk prediction setup."
            ],
        }

    except Exception as error:
        return {
            "status": "error",
            "message": str(error),
            "total_projects_analyzed": 0,
            "high_risk_projects": 0,
            "medium_risk_projects": 0,
            "low_risk_projects": 0,
            "projects": [],
            "recommendations": [
                "Check risk_prediction/predict.py and its dependencies."
            ],
        }


# Compatibility alias for the executive agent.
# Both names call the same risk analysis function.
def get_project_risk_report():
    """
    Return the project risk analysis report.

    This alias supports code that imports get_project_risk_report().
    """
    return analyze_project_risks()


if __name__ == "__main__":
    print("\n=== PROJECT RISK ANALYSIS AGENT ===\n")

    result = analyze_project_risks()

    print("Status:", result["status"])

    if result["status"] == "success":
        print("Projects analyzed:", result["total_projects_analyzed"])
        print("High-risk projects:", result["high_risk_projects"])
        print("Medium-risk projects:", result["medium_risk_projects"])
        print("Low-risk projects:", result["low_risk_projects"])

        print("\nProject predictions:")

        for project in result["projects"]:
            print(project)

        print("\nRecommendations:")

        for recommendation in result["recommendations"]:
            print("-", recommendation)

    else:
        print("Message:", result.get("message"))

        for recommendation in result.get("recommendations", []):
            print("-", recommendation)
