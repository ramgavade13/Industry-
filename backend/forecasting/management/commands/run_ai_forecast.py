"""
Forecasts the next 3 months of revenue and expenses from the revenue history in
the database and stores the result for the forecasting page.

    python manage.py run_ai_forecast

Replaces the rows in Forecast and ForecastNote.
"""

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from finance.models import RevenueMonth
from forecasting.ml.trend import forecast_series, next_month_labels
from forecasting.models import Forecast, ForecastNote

PERIODS_AHEAD = 3
BACKTEST_MONTHS = 3


class Command(BaseCommand):
    help = "Forecast revenue and expenses and refresh the forecasting data."

    def handle(self, *args, **options):
        history = list(RevenueMonth.objects.order_by("id"))
        if len(history) < 4:
            raise CommandError("Need at least 4 months of revenue history in RevenueMonth.")

        labels = [h.month for h in history]
        revenue = [h.revenue for h in history]
        expenses = [h.expenses for h in history]

        rev = forecast_series(revenue, PERIODS_AHEAD, BACKTEST_MONTHS)
        exp = forecast_series(expenses, PERIODS_AHEAD, BACKTEST_MONTHS)
        future_labels = next_month_labels(labels[-1], PERIODS_AHEAD)
        n_back = len(rev["fitted"])

        last_rev, last_exp = rev["future"][-1], exp["future"][-1]
        margin = round((last_rev - last_exp) / last_rev * 100, 1) if last_rev else 0.0
        error_text = (
            f"{rev['error_pct']}%" if rev["error_pct"] is not None else "an unknown amount"
        )

        with transaction.atomic():
            Forecast.objects.all().delete()
            for label, actual, fitted in zip(labels[-n_back:], revenue[-n_back:], rev["fitted"]):
                Forecast.objects.create(month=label, actual=actual, forecast=fitted)
            for label, value in zip(future_labels, rev["future"]):
                Forecast.objects.create(month=label, actual=None, forecast=value)

            ForecastNote.objects.all().delete()
            ForecastNote.objects.create(
                title="Revenue trend",
                detail=(
                    f"Revenue has grown by about ₹{rev['slope']}L per month over the last "
                    f"{len(history)} months and is forecast to reach ₹{last_rev}L by {future_labels[-1]}."
                ),
            )
            ForecastNote.objects.create(
                title="Expenses outlook",
                detail=(
                    f"Expenses are forecast to reach ₹{last_exp}L by {future_labels[-1]}, "
                    f"which keeps the profit margin at about {margin}%."
                ),
            )
            ForecastNote.objects.create(
                title="Forecast confidence",
                detail=(
                    f"Tested on the last {n_back} months, the revenue forecast was off by "
                    f"{error_text} on average. This is a simple trend model, so treat it as an estimate."
                ),
            )

        self.stdout.write(self.style.SUCCESS("Forecast updated."))
        self.stdout.write("  Revenue (₹L): " + ", ".join(f"{l} {v}" for l, v in zip(future_labels, rev["future"])))
        self.stdout.write("  Expenses (₹L): " + ", ".join(f"{l} {v}" for l, v in zip(future_labels, exp["future"])))
        self.stdout.write(f"  Back-test error: {error_text}")