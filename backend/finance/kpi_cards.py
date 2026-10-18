"""
The calculated KPI cards as simple objects with .label .value .change .trend,
the same shape as the old KPI table rows. The chat and the PDF reports use this,
so they show the same numbers as the dashboard.
"""

from types import SimpleNamespace

from .kpis import build_kpis


def kpi_cards():
    return [SimpleNamespace(**card) for card in build_kpis()]