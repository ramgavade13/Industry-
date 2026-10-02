from django.conf import settings
from django.db import models

STATUS_CHOICES = [
    ("On track", "On track"),
    ("At risk", "At risk"),
    ("Not started", "Not started"),
]


class Project(models.Model):
    STATUS = [
        ("planning", "Planning"),
        ("active", "Active"),
        ("on_hold", "On hold"),
        ("completed", "Completed"),
    ]
    name = models.CharField(max_length=150, unique=True)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS, default="planning")
    budget = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    spent = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="managed_projects",
    )
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class TeamProductivity(models.Model):
    team = models.CharField(max_length=50)
    completed = models.IntegerField()
    pending = models.IntegerField()

    def __str__(self):
        return self.team


class WorkloadItem(models.Model):
    member = models.CharField(max_length=100)
    task = models.CharField(max_length=200)
    due = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)

    def __str__(self):
        return f"{self.member} - {self.task}"


class Task(models.Model):
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="my_tasks",
    )
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="team_tasks",
        null=True, blank=True,
    )
    task = models.CharField(max_length=200)
    due = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    # new, all optional
    project = models.ForeignKey(
        Project, on_delete=models.SET_NULL, null=True, blank=True, related_name="tasks",
    )
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        return self.task