"""
Builds the four summary cards of the Forecasting page from the revenue and
expense history, using the same trend model as the forecast chart, so the cards
and the chart always agree.
"""

from .trend import forecast_series


def _change(new, old):
    """('+4.9%', 'up') - percentage change from old to new."""
    if not old:
        return "—", "up"
    pct = (new - old) / abs(old) * 100
    return f"{pct:+.1f}%", ("up" if pct >= 0 else "down")


def _empty_cards():
    return [
        {"label": label, "value": "—", "change": "—", "trend": "up"}
        for label in ("Next Month Revenue", "Next Quarter Revenue",
                      "Next Quarter Expenses", "Forecast Confidence")
    ]


def build_summary_cards(revenue, expenses):
    """revenue / expenses: monthly values in ₹ lakhs, oldest first."""
    if len(revenue) < 4 or len(expenses) < 4:
        return _empty_cards()

    rev = forecast_series(revenue, 3, 3)
    exp = forecast_series(expenses, 3, 3)

    next_month = rev["future"][0]
    month_change, month_trend = _change(next_month, revenue[-1])

    quarter_rev = round(sum(rev["future"]), 1)
    rev_change, rev_trend = _change(quarter_rev, sum(revenue[-3:]))

    quarter_exp = round(sum(exp["future"]), 1)
    exp_change, exp_trend = _change(quarter_exp, sum(expenses[-3:]))

    error = rev["error_pct"]
    if error is None:
        confidence_value, confidence_change = "—", "—"
    else:
        confidence_value = f"{max(0.0, 100 - error):.1f}%"
        confidence_change = f"±{error}% error"

    return [
        {"label": "Next Month Revenue", "value": f"₹{next_month}L", "change": month_change, "trend": month_trend},
        {"label": "Next Quarter Revenue", "value": f"₹{quarter_rev}L", "change": rev_change, "trend": rev_trend},
        {"label": "Next Quarter Expenses", "value": f"₹{quarter_exp}L", "change": exp_change, "trend": exp_trend},
        {"label": "Forecast Confidence", "value": confidence_value, "change": confidence_change, "trend": "up"},
    ]