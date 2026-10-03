from django.contrib import admin
from .models import TeamProductivity, WorkloadItem, Task
from .models import Project


admin.site.register(TeamProductivity)
admin.site.register(WorkloadItem)
admin.site.register(Task)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("name", "status", "budget", "spent", "manager")
    list_filter = ("status",)