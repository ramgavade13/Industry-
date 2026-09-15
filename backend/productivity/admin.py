from django.contrib import admin
from .models import TeamProductivity, WorkloadItem, Task

admin.site.register(TeamProductivity)
admin.site.register(WorkloadItem)
admin.site.register(Task)