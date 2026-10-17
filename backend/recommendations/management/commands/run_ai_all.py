"""
Runs the whole AI pipeline in the right order:
risk model -> forecast -> recommendations.

    python manage.py run_ai_all
"""

from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Run the risk model, the forecast and the recommendation generator."

    def handle(self, *args, **options):
        call_command("run_ai_analysis")
        call_command("run_ai_forecast")
        call_command("run_ai_recommendations")