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
    project = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = ["member", "task", "due", "status", "priority", "project"]

    def get_project(self, obj):
        return obj.project.name if obj.project else ""


class MyTaskSerializer(serializers.ModelSerializer):
    project = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = ["task", "due", "status", "priority", "project"]

    def get_project(self, obj):
        return obj.project.name if obj.project else ""