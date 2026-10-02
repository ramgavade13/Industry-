from datetime import date, datetime
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

from finance.models import FinancialRecord, KPI, KPIValue
from productivity.models import Project, Task
from reports.models import Report
from risk.models import RiskAlert

User = get_user_model()


class Command(BaseCommand):
    help = "Fill the new schema tables. Run seed_demo first."

    def handle(self, *args, **options):
        manager = User.objects.filter(username="manager_demo").first()
        ceo = User.objects.filter(username="ceo_demo").first()
        if not manager or not KPI.objects.exists():
            raise CommandError("Run `python manage.py seed_demo` first.")

        for model in (KPIValue, FinancialRecord, Report, Project):
            model.objects.all().delete()

        # Projects
        specs = [
            ("Mobile App Revamp", "active", 2500000, 1800000, date(2026, 6, 1), date(2026, 12, 15)),
            ("Data Warehouse Migration", "active", 1800000, 1250000, date(2026, 5, 1), date(2026, 11, 30)),
            ("Customer Portal", "planning", 900000, 300000, date(2026, 8, 1), date(2027, 1, 31)),
        ]
        projects = {}
        for name, status, budget, spent, start, end in specs:
            projects[name] = Project.objects.create(
                name=name, status=status, budget=Decimal(budget), spent=Decimal(spent),
                start_date=start, end_date=end, manager=manager,
            )

        # Link tasks to projects and fill real dates
        project_list = list(projects.values())
        for i, task in enumerate(Task.objects.order_by("id")):
            task.project = project_list[i % len(project_list)]
            try:
                task.due_date = datetime.strptime(f"{task.due} 2026", "%b %d %Y").date()
            except ValueError:
                pass
            task.save()

        # Risks: link to project and add a score
        scores = {"high": 82, "medium": 55, "low": 25}
        for risk in RiskAlert.objects.all():
            risk.project_ref = projects.get(risk.project)
            risk.score = scores.get(risk.severity)
            risk.save()

        # KPI targets and monthly history (Apr to Sep 2026)
        periods = [date(2026, m, 1) for m in range(4, 10)]
        kpi_setup = {
            "Revenue": ("₹L", 45, 40, [31.2, 33.5, 35.1, 38.4, 40.2, 42.6]),
            "Expenses": ("₹L", 27, 30, [22.0, 23.1, 24.8, 26.0, 27.3, 28.4]),
            "Net Profit": ("₹L", 15, 12, [9.2, 10.4, 10.3, 12.4, 12.9, 14.2]),
            "Customer Churn": ("%", 4.0, 5.0, [3.9, 4.0, 4.2, 4.4, 4.6, 4.8]),
        }
        for kpi in KPI.objects.all():
            setup = kpi_setup.get(kpi.label)
            if not setup:
                continue
            kpi.unit, kpi.target, kpi.threshold = setup[0], setup[1], setup[2]
            kpi.save()
            for period, actual in zip(periods, setup[3]):
                KPIValue.objects.create(kpi=kpi, period=period, actual=actual)

        # Financial records: company-wide per month (no project)
        revenue = [31.2, 33.5, 35.1, 38.4, 40.2, 42.6]
        expenses = [22.0, 23.1, 24.8, 26.0, 27.3, 28.4]
        for period, rev, exp in zip(periods, revenue, expenses):
            FinancialRecord.objects.create(
                period=period, revenue=Decimal(str(rev)), expenses=Decimal(str(exp)),
            )
        # ...and a September split by project (adds up to the company total)
        for project, rev, exp in zip(project_list, ("18.5", "14.2", "9.9"), ("12.1", "9.8", "6.5")):
            FinancialRecord.objects.create(
                period=periods[-1], revenue=Decimal(rev), expenses=Decimal(exp), project=project,
            )

        # Report history
        for rtype, title in [
            ("executive", "Executive Summary Report"),
            ("kpi", "KPI Report"),
            ("financial", "Financial Report"),
            ("risk", "Risk Report"),
        ]:
            Report.objects.create(report_type=rtype, title=title, generated_by=ceo)

        self.stdout.write(self.style.SUCCESS("Schema demo data created."))