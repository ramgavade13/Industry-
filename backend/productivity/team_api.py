from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import CEO_ADMIN_MANAGER
from .project_api import _visible_projects
from .task_api import _visible_tasks


class TeamListView(APIView):
    """
    Teams with their projects, members and task progress (SRS: view employees by team).

    A project belongs to a team; a person is a member of a team when they have tasks
    in that team's projects. Executives/Admins see every team, a Manager sees the
    teams of their own projects.
    """
    permission_classes = [CEO_ADMIN_MANAGER]

    def get(self, request):
        teams = {}

        def entry(name):
            return teams.setdefault(name, {"team": name, "projects": [], "members": {}})

        for project in _visible_projects(request.user).exclude(team=""):
            entry(project.team)["projects"].append(project.name)

        tasks = (
            _visible_tasks(request.user)
            .filter(project__isnull=False)
            .exclude(project__team="")
            .select_related("assignee", "project")
        )
        for task in tasks:
            member = entry(task.project.team)["members"].setdefault(task.assignee_id, {
                "id": task.assignee_id,
                "name": task.assignee.first_name or task.assignee.username,
                "tasks": 0, "completed": 0, "delayed": 0,
            })
            member["tasks"] += 1
            member["completed"] += 1 if task.status == "Completed" else 0
            member["delayed"] += 1 if task.status == "Delayed" else 0

        result = []
        for name in sorted(teams):
            data = teams[name]
            members = sorted(data["members"].values(), key=lambda m: m["name"])
            total = sum(m["tasks"] for m in members)
            done = sum(m["completed"] for m in members)
            result.append({
                "team": name,
                "projects": sorted(data["projects"]),
                "project_count": len(data["projects"]),
                "member_count": len(members),
                "tasks_total": total,
                "tasks_completed": done,
                "tasks_delayed": sum(m["delayed"] for m in members),
                "completion_rate": round(done / total * 100) if total else 0,
                "members": members,
            })
        return Response(result)