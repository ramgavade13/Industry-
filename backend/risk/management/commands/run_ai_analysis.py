"""
Runs the AI risk model and stores the results in the RiskAlert table.

    python manage.py run_ai_analysis

The model is trained again on the current project data every time (it takes a
moment), then every project is scored. The dashboards, reports and chat all read
RiskAlert, so they show the model's results after this command runs.
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from risk.ml.engine import analyze_projects, load_rows_with_source
from risk.models import RiskAlert


class Command(BaseCommand):
    help = "Run the AI risk model and refresh the risk alerts."

    def handle(self, *args, **options):
        source = load_rows_with_source()[1]
        results = analyze_projects(retrain=True)
        risky = [r for r in results if r["risk_level"] != "Low"]

        with transaction.atomic():
            RiskAlert.objects.all().delete()
            for r in risky:
                RiskAlert.objects.create(
                    project=r["project_name"][:150],
                    risk=r["reason"][:200],
                    severity=r["risk_level"].lower(),
                    score=r["score"],
                    project_ref_id=r["pk"],
                )

        self.stdout.write(self.style.SUCCESS(
            f"Analysed {len(results)} projects (data from the {source}), saved {len(risky)} risk alerts."
        ))
        for r in risky:
            self.stdout.write(f"  [{r['risk_level']}] {r['project_name']} (score {r['score']}) - {r['reason']}")