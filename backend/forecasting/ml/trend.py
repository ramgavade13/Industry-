"""
Revenue / expense forecasting (FR-12), based on Pranav's forecasting module.

Method: a straight-line trend fitted with numpy.polyfit (the same method as his
revenue_forecast.py). It is plain statistics, easy to explain to a CEO, and it
needs no external AI service.

Besides the future months, it also "back-tests" itself: for each of the last 3
known months it predicts the month using only the months before it, and
compares that with the real value. The average gap is reported as the
model's error, so the confidence note is measured, not typed in by hand.
"""

import numpy as np

MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
               "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def _line(values):
    """Slope and intercept of the straight line through the values."""
    x = np.arange(len(values))
    slope, intercept = np.polyfit(x, np.asarray(values, dtype=float), 1)
    return float(slope), float(intercept)


def next_month_labels(last_label, count):
    """['Sep'] -> ['Oct', 'Nov', 'Dec']. Falls back to 'M+1' if the label is unknown."""
    key = str(last_label).strip()[:3].title()
    if key in MONTH_NAMES:
        i = MONTH_NAMES.index(key)
        return [MONTH_NAMES[(i + k) % 12] for k in range(1, count + 1)]
    return [f"M+{k}" for k in range(1, count + 1)]


def forecast_series(values, periods_ahead=3, backtest_months=3):
    """
    values: monthly numbers, oldest first (at least 4).
    Returns:
      fitted   - one-step-ahead prediction for each of the last `backtest_months` months
      future   - predictions for the next `periods_ahead` months
      slope    - average change per month
      error_pct- average back-test error in percent
    """
    values = [float(v) for v in values]
    n = len(values)
    if n < 4:
        raise ValueError("Need at least 4 months of history to forecast.")

    backtest_months = min(backtest_months, n - 2)

    fitted, errors = [], []
    for i in range(n - backtest_months, n):
        slope, intercept = _line(values[:i])
        predicted = slope * i + intercept
        fitted.append(round(predicted, 1))
        if values[i]:
            errors.append(abs(predicted - values[i]) / abs(values[i]) * 100)

    slope, intercept = _line(values)
    future = [round(slope * (n + k) + intercept, 1) for k in range(periods_ahead)]

    return {
        "fitted": fitted,
        "future": future,
        "slope": round(slope, 2),
        "error_pct": round(sum(errors) / len(errors), 1) if errors else None,
    }