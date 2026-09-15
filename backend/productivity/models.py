from django.db import models
from django.conf import settings

STATUS_CHOICES = [
    ("On track", "On track"),
    ("At risk", "At risk"),
    ("Not started", "Not started"),
]


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
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="my_tasks",
    )
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="team_tasks",
        null=True,
        blank=True,
    )
    task = models.CharField(max_length=200)
    due = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)

    def __str__(self):
        return self.task