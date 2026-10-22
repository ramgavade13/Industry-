"""
Forecasts future revenue/expenses using a simple linear trend model.
No external AI/API needed -- this is plain statistics (numpy polyfit),
which is the right tool here: your financials.csv has a clear enough trend
that a straight-line fit is both explainable to a CEO and accurate enough
for a first version. A fancier time-series model can replace this later
without changing anything that calls forecast_metric().
"""

import os
import sys
import numpy as np
import pandas as pd

sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data_processing"))
from preprocessing import load_financials  # noqa: E402


def forecast_metric(financials_df: pd.DataFrame, column: str, periods_ahead: int = 3) -> pd.DataFrame:
    df = financials_df.sort_values("month").reset_index(drop=True)
    x = np.arange(len(df))
    y = df[column].values

    slope, intercept = np.polyfit(x, y, 1)

    future_x = np.arange(len(df), len(df) + periods_ahead)
    future_values = slope * future_x + intercept

    last_month = df["month"].iloc[-1]
    future_months = pd.date_range(last_month, periods=periods_ahead + 1, freq="MS")[1:]

    history = df[["month", column]].rename(columns={column: "value"})
    history["type"] = "actual"

    forecast = pd.DataFrame({"month": future_months, "value": future_values.round(0), "type": "forecast"})

    return pd.concat([history, forecast], ignore_index=True)


def forecast_revenue(financials_df: pd.DataFrame = None, periods_ahead: int = 3) -> pd.DataFrame:
    financials_df = financials_df if financials_df is not None else load_financials()
    return forecast_metric(financials_df, "revenue", periods_ahead)


def forecast_expenses(financials_df: pd.DataFrame = None, periods_ahead: int = 3) -> pd.DataFrame:
    financials_df = financials_df if financials_df is not None else load_financials()
    return forecast_metric(financials_df, "expenses", periods_ahead)


if __name__ == "__main__":
    revenue_forecast = forecast_revenue()
    print("Revenue forecast (last 3 actual + next 3 predicted):")
    print(revenue_forecast.tail(6).to_string(index=False))

    expense_forecast = forecast_expenses()
    print("\nExpense forecast (last 3 actual + next 3 predicted):")
    print(expense_forecast.tail(6).to_string(index=False))