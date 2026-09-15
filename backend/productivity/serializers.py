from rest_framework import serializers
from .models import TeamProductivity, WorkloadItem, Task


class TeamProductivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamProductivity
        fields = ["team", "completed", "pending"]


class WorkloadItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkloadItem
        fields = ["member", "task", "due", "status"]


class TeamTaskSerializer(serializers.ModelSerializer):
    member = serializers.CharField(source="assignee.first_name")

    class Meta:
        model = Task
        fields = ["member", "task", "due", "status"]


class MyTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ["task", "due", "status"]