"""
Runs the AI risk model and stores the results in the RiskAlert table.

    python manage.py run_ai_analysis             # use the saved model (trains it the first time)
    python manage.py run_ai_analysis --retrain   # train the model again first

The dashboards, reports and chat all read RiskAlert, so they show the model's
results after this command runs.
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from risk.ml.engine import analyze_projects
from risk.models import RiskAlert


class Command(BaseCommand):
    help = "Run the AI risk model and refresh the risk alerts."

    def add_arguments(self, parser):
        parser.add_argument("--retrain", action="store_true", help="Train the model again before predicting.")

    def handle(self, *args, **options):
        results = analyze_projects(retrain=options["retrain"])
        risky = [r for r in results if r["risk_level"] != "Low"]

        with transaction.atomic():
            RiskAlert.objects.all().delete()
            for r in risky:
                RiskAlert.objects.create(
                    project=r["project_name"][:150],
                    risk=r["reason"][:200],
                    severity=r["risk_level"].lower(),
                    score=r["score"],
                )

        self.stdout.write(self.style.SUCCESS(
            f"Analysed {len(results)} projects, saved {len(risky)} risk alerts."
        ))
        for r in risky:
            self.stdout.write(f"  [{r['risk_level']}] {r['project_name']} (score {r['score']}) - {r['reason']}")