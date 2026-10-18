"""
Loads the demo projects and tasks into the database (from the CSV files in
risk/ml/data) so the AI risk model, the dashboards and the chat all read the
same project and task data.

    python manage.py seed_demo            # users first
    python manage.py seed_project_data

Dates are relative to today (deadline_days / due_days in the CSV), so run it
again whenever you want the demo dates refreshed. It replaces all Projects,
Tasks, Workload rows and Team productivity rows.
"""

import csv
from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from finance.models import FinancialRecord
from productivity.models import Project, Task, TeamProductivity, WorkloadItem
from risk.ml.engine import DATA_DIR

User = get_user_model()

EMPLOYEE_USERNAMES = ("amit_demo", "sneha_demo", "karan_demo", "employee_demo")

# The CSV has no task names, so each project's tasks get these standard phases.
TASK_PHASES = [
    "Requirements review", "API development", "UI implementation",
    "Testing and QA", "Deployment", "Documentation",
]

# The workload list still uses the older status words.
WORKLOAD_STATUS = {"Delayed": "At risk", "In Progress": "On track", "Not Started": "Not started"}


def read_csv(name):
    with open(DATA_DIR / name, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


class Command(BaseCommand):
    help = "Load the demo projects and tasks into the database. Run seed_demo first."

    def handle(self, *args, **options):
        manager = User.objects.filter(username="manager_demo").first()
        employees = [u for u in (User.objects.filter(username=n).first() for n in EMPLOYEE_USERNAMES) if u]
        if not manager or not employees:
            raise CommandError("Run `python manage.py seed_demo` first.")

        today = date.today()
        project_rows = read_csv("projects.csv")
        task_rows = read_csv("tasks.csv")

        with transaction.atomic():
            # Project-linked finance rows would otherwise become company-wide rows.
            FinancialRecord.objects.filter(project__isnull=False).delete()
            Task.objects.all().delete()
            WorkloadItem.objects.all().delete()
            TeamProductivity.objects.all().delete()
            Project.objects.all().delete()

            projects = {}
            for row in project_rows:
                projects[row["project_id"].strip()] = Project.objects.create(
                    name=row["project_name"].strip(),
                    description=f"{row['team'].strip()} team project",
                    status="active",
                    budget=Decimal(row["budget"]),
                    spent=Decimal(row["actual_cost"]),
                    progress=int(float(row["progress"])),
                    team=row["team"].strip(),
                    team_size=int(float(row["team_size"])),
                    start_date=today - timedelta(days=30),
                    end_date=today + timedelta(days=int(float(row["deadline_days"]))),
                    manager=manager,
                )

            owners, per_project = {}, {}
            for row in task_rows:
                project = projects[row["project_id"].strip()]
                n = per_project[project.pk] = per_project.get(project.pk, 0) + 1
                employee = owners.setdefault(row["employee_id"].strip(), employees[len(owners) % len(employees)])
                Task.objects.create(
                    assignee=employee,
                    manager=manager,
                    task=f"{project.name} - {TASK_PHASES[(n - 1) % len(TASK_PHASES)]}",
                    status=row["status"].strip().title(),
                    priority=row["priority"].strip().title(),
                    project=project,
                    due_date=today + timedelta(days=int(float(row["due_days"]))),
                )

            # Team productivity, calculated from the tasks of each team's projects.
            for team in sorted({p.team for p in projects.values()}):
                tasks = Task.objects.filter(project__team=team)
                TeamProductivity.objects.create(
                    team=team,
                    completed=tasks.filter(status="Completed").count(),
                    pending=tasks.exclude(status="Completed").count(),
                )

            # Workload: the next open tasks.
            for t in Task.objects.exclude(status="Completed").select_related("assignee").order_by("due_date")[:6]:
                WorkloadItem.objects.create(
                    member=t.assignee.first_name or t.assignee.username,
                    task=t.task,
                    due=t.due,
                    status=WORKLOAD_STATUS.get(t.status, "Not started"),
                )

        self.stdout.write(self.style.SUCCESS(
            f"Loaded {len(projects)} projects and {len(task_rows)} tasks."
        ))