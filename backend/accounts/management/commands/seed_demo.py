from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from finance.models import KPI, RevenueMonth
from forecasting.models import Forecast, ForecastNote
from productivity.models import Task, TeamProductivity, WorkloadItem
from recommendations.models import Recommendation
from risk.models import RiskAlert

User = get_user_model()


class Command(BaseCommand):
    help = "Fill the database with demo data (safe to run more than once)."

    def handle(self, *args, **options):
        # Wipe demo tables (users are kept)
        for model in (KPI, RevenueMonth, Forecast, ForecastNote, Task,
                      TeamProductivity, WorkloadItem, Recommendation, RiskAlert):
            model.objects.all().delete()

        # Users
        def make_user(username, first, role):
            user, created = User.objects.get_or_create(
                username=username,
                defaults={"first_name": first, "role": role,
                          "email": f"{username}@example.com"},
            )
            if created:
                user.set_password("Demo@1234")
                user.save()
            return user

        ceo = make_user("ceo_demo", "Rohan", "ceo")
        manager = make_user("manager_demo", "Priya", "manager")
        emp1 = make_user("amit_demo", "Amit", "employee")
        emp2 = make_user("sneha_demo", "Sneha", "employee")
        emp3 = make_user("karan_demo", "Karan", "employee")

        # Finance
        KPI.objects.bulk_create([
            KPI(label="Revenue", value="₹42.6L", change="+8.2%", trend="up"),
            KPI(label="Expenses", value="₹28.4L", change="+3.1%", trend="up"),
            KPI(label="Net Profit", value="₹14.2L", change="+12.5%", trend="up"),
            KPI(label="Customer Churn", value="4.8%", change="+0.6%", trend="down"),
        ])
        months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"]
        revenue = [31.2, 33.5, 35.1, 38.4, 40.2, 42.6]
        expenses = [22.0, 23.1, 24.8, 26.0, 27.3, 28.4]
        RevenueMonth.objects.bulk_create([
            RevenueMonth(month=m, revenue=r, expenses=e)
            for m, r, e in zip(months, revenue, expenses)
        ])

        # Forecasting (actual is empty for future months)
        Forecast.objects.bulk_create([
            Forecast(month="Jul", actual=38.4, forecast=37.9),
            Forecast(month="Aug", actual=40.2, forecast=40.0),
            Forecast(month="Sep", actual=42.6, forecast=42.1),
            Forecast(month="Oct", actual=None, forecast=44.3),
            Forecast(month="Nov", actual=None, forecast=46.0),
            Forecast(month="Dec", actual=None, forecast=48.2),
        ])
        ForecastNote.objects.bulk_create([
            ForecastNote(title="Seasonal uplift expected",
                         detail="Q4 revenue usually rises because of festival-season demand."),
            ForecastNote(title="Forecast confidence",
                         detail="Model error has stayed within 2% over the last three months."),
        ])

        # Risk
        RiskAlert.objects.bulk_create([
            RiskAlert(project="Mobile App Revamp", risk="Delivery delayed by two sprints", severity="high"),
            RiskAlert(project="Data Warehouse Migration", risk="Budget overrun of about 12%", severity="medium"),
            RiskAlert(project="Customer Portal", risk="Minor scope creep", severity="low"),
        ])

        # Productivity
        TeamProductivity.objects.bulk_create([
            TeamProductivity(team="Engineering", completed=42, pending=11),
            TeamProductivity(team="Sales", completed=35, pending=9),
            TeamProductivity(team="Support", completed=51, pending=6),
            TeamProductivity(team="Design", completed=18, pending=7),
        ])
        WorkloadItem.objects.bulk_create([
            WorkloadItem(member="Amit", task="API integration", due="Oct 12", status="On track"),
            WorkloadItem(member="Sneha", task="Quarterly report", due="Oct 09", status="At risk"),
            WorkloadItem(member="Karan", task="Client onboarding flow", due="Oct 20", status="Not started"),
        ])
        Task.objects.bulk_create([
            Task(assignee=emp1, manager=manager, task="Build KPI endpoints", due="Oct 10", status="On track"),
            Task(assignee=emp2, manager=manager, task="Prepare revenue charts", due="Oct 08", status="At risk"),
            Task(assignee=emp3, manager=manager, task="Write test cases", due="Oct 18", status="Not started"),
        ])

        # Recommendations
        Recommendation.objects.bulk_create([
            Recommendation(
                title="Reduce customer churn",
                problem="Churn has risen to 4.8% this quarter.",
                evidence="Support tickets about onboarding doubled in the last two months.",
                action="Launch a guided onboarding program for new customers.",
                impact="Could lower churn by about 1 percentage point within a quarter.",
                confidence="High"),
            Recommendation(
                title="Rebalance engineering workload",
                problem="One project is two sprints behind schedule.",
                evidence="Engineering has the most pending tasks of any team.",
                action="Move two engineers from the portal project to the app revamp.",
                impact="Likely to recover one sprint of delay.",
                confidence="Medium"),
        ])

        self.stdout.write(self.style.SUCCESS("Demo data created."))
        self.stdout.write("Demo users: ceo_demo, manager_demo, amit_demo, sneha_demo, karan_demo")
        self.stdout.write("Password for all demo users: Demo@1234")