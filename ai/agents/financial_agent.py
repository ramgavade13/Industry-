
"""
Financial Analysis Agent

Responsibilities:
- Read financial and project data.
- Calculate financial KPIs.
- Summarize revenue, expenses, and profit.
- Calculate profit margins and expense trends.
- Identify financial issues and provide recommendations.
"""

from pathlib import Path
import sys

import pandas as pd


# Locate the main AI project directory.
AI_DIR = Path(__file__).resolve().parents[1]

if str(AI_DIR) not in sys.path:
    sys.path.insert(0, str(AI_DIR))

DATA_DIR = AI_DIR / "data"


def load_financial_data():
    """Load financial and project information from CSV files."""

    financial_file = DATA_DIR / "financials.csv"
    projects_file = DATA_DIR / "projects.csv"

    if not financial_file.exists():
        raise FileNotFoundError(
            f"Financial data file not found: {financial_file}"
        )

    financials = pd.read_csv(financial_file)
    projects = (
        pd.read_csv(projects_file)
        if projects_file.exists()
        else None
    )

    return financials, projects


def analyze_financials():
    """Analyze financial data and return structured financial KPIs."""

    financials, projects = load_financial_data()

    if financials.empty:
        return {
            "status": "no_data",
            "message": "The financial data file contains no records.",
            "financial_summary": {},
            "warnings": [],
        }

    # Normalize column names.
    financials.columns = [
        str(column).strip().lower().replace(" ", "_")
        for column in financials.columns
    ]

    result = {
        "status": "success",
        "total_records": int(len(financials)),
        "columns": list(financials.columns),
        "financial_summary": {},
        "warnings": [],
    }

    # Calculate summaries for numeric columns.
    numeric_columns = financials.select_dtypes(
        include="number"
    ).columns

    for column in numeric_columns:
        series = financials[column].dropna()

        result["financial_summary"][column] = {
            "total": round(float(series.sum()), 2),
            "average": round(float(series.mean()), 2),
            "minimum": round(float(series.min()), 2),
            "maximum": round(float(series.max()), 2),
        }

    # Calculate common financial KPIs when the required columns exist.
    required_columns = {"revenue", "expenses", "profit"}
    missing_columns = required_columns - set(financials.columns)

    if not missing_columns:
        revenue = pd.to_numeric(
            financials["revenue"], errors="coerce"
        )
        expenses = pd.to_numeric(
            financials["expenses"], errors="coerce"
        )
        profit = pd.to_numeric(
            financials["profit"], errors="coerce"
        )

        total_revenue = float(revenue.sum())
        total_expenses = float(expenses.sum())
        total_profit = float(profit.sum())

        result["total_revenue"] = round(total_revenue, 2)
        result["total_expenses"] = round(total_expenses, 2)
        result["total_profit"] = round(total_profit, 2)

        result["average_monthly_revenue"] = round(
            float(revenue.mean()), 2
        )
        result["average_monthly_expenses"] = round(
            float(expenses.mean()), 2
        )
        result["average_monthly_profit"] = round(
            float(profit.mean()), 2
        )

        if total_revenue != 0:
            result["profit_margin_percent"] = round(
                (total_profit / total_revenue) * 100, 2
            )
        else:
            result["profit_margin_percent"] = None
            result["warnings"].append(
                "Profit margin could not be calculated because "
                "total revenue is zero."
            )

        # Compare the first and last recorded expense values.
        if len(financials) >= 2:
            first_expense = expenses.iloc[0]
            last_expense = expenses.iloc[-1]

            if pd.notna(first_expense) and pd.notna(last_expense):
                expense_change = float(last_expense - first_expense)

                result["expense_change"] = round(
                    expense_change, 2
                )

                if first_expense != 0:
                    result["expense_change_percent"] = round(
                        (expense_change / first_expense) * 100,
                        2,
                    )
                else:
                    result["expense_change_percent"] = None

                if expense_change > 0:
                    result["expense_trend"] = "increasing"
                elif expense_change < 0:
                    result["expense_trend"] = "decreasing"
                else:
                    result["expense_trend"] = "unchanged"

    else:
        result["warnings"].append(
            "Some financial KPIs could not be calculated. "
            f"Missing columns: {', '.join(sorted(missing_columns))}."
        )

    # Look for budget information without inventing missing values.
    budget_columns = [
        "budget",
        "allocated_budget",
        "planned_budget",
    ]

    spending_columns = [
        "actual_cost",
        "actual_spending",
        "spent",
        "expenses",
    ]

    budget_column = next(
        (
            column
            for column in budget_columns
            if column in financials.columns
        ),
        None,
    )

    spending_column = next(
        (
            column
            for column in spending_columns
            if column in financials.columns
        ),
        None,
    )

    if budget_column and spending_column:
        total_budget = float(
            pd.to_numeric(
                financials[budget_column], errors="coerce"
            ).sum()
        )

        total_spending = float(
            pd.to_numeric(
                financials[spending_column], errors="coerce"
            ).sum()
        )

        result["total_budget"] = round(total_budget, 2)
        result["total_spending"] = round(total_spending, 2)
        result["budget_remaining"] = round(
            total_budget - total_spending, 2
        )

        if total_budget > 0:
            result["budget_utilization_percent"] = round(
                (total_spending / total_budget) * 100, 2
            )
        else:
            result["budget_utilization_percent"] = None
            result["warnings"].append(
                "Budget utilization is unavailable because "
                "the recorded budget is zero or invalid."
            )
    else:
        result["budget_utilization_percent"] = None
        result["warnings"].append(
            "Budget utilization is unavailable because the "
            "financial data does not contain both budget and "
            "spending columns."
        )

    if projects is not None:
        result["project_records"] = int(len(projects))

    return result


def get_financial_recommendations():
    """Generate recommendations from the financial analysis."""

    analysis = analyze_financials()
    recommendations = []

    if analysis["status"] != "success":
        return {
            "analysis": analysis,
            "recommendations": [
                "Check whether the financial data file contains records."
            ],
        }

    utilization = analysis.get("budget_utilization_percent")

    if utilization is not None:
        if utilization > 100:
            recommendations.append(
                "Review spending because it exceeds the recorded budget."
            )
        elif utilization >= 90:
            recommendations.append(
                "Monitor remaining funds because budget utilization "
                "has reached at least 90%."
            )
        else:
            recommendations.append(
                "Continue monitoring spending against the approved budget."
            )

    profit_margin = analysis.get("profit_margin_percent")

    if profit_margin is not None:
        if profit_margin < 0:
            recommendations.append(
                "Investigate the financial loss and review revenue "
                "and expense drivers."
            )
        elif profit_margin < 10:
            recommendations.append(
                "Review operating costs and revenue opportunities "
                "to improve the profit margin."
            )
        else:
            recommendations.append(
                "Monitor the profit margin and maintain cost controls."
            )

    if analysis.get("expense_trend") == "increasing":
        recommendations.append(
            "Expenses increased between the first and last recorded "
            "period. Review the causes and check whether revenue "
            "is growing at a sustainable rate."
        )
    elif analysis.get("expense_trend") == "decreasing":
        recommendations.append(
            "Expenses decreased between the first and last recorded "
            "period. Verify that cost reductions are sustainable."
        )

    recommendations.extend(analysis.get("warnings", []))

    if not recommendations:
        recommendations.append(
            "Review the financial summary with the project manager."
        )

    return {
        "analysis": analysis,
        "recommendations": recommendations,
    }


if __name__ == "__main__":
    print("\n=== FINANCIAL ANALYSIS AGENT ===\n")

    try:
        result = get_financial_recommendations()

        print("Analysis:")
        print(result["analysis"])

        print("\nRecommendations:")

        for recommendation in result["recommendations"]:
            print(f"- {recommendation}")

    except Exception as error:
        print(f"Error: {error}")
