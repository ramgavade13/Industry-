"""
Project-progress forecast (SRS FR-12).

For every project we look at how fast it has progressed since its start date
(percent per day), assume the same pace continues, and estimate:
  - the date it will reach 100%
  - how many days that is after (or before) the planned end date
  - how far along it will be on the planned end date
"""

from datetime import date, timedelta
from math import ceil

from productivity.models import Project

MAX_DAYS = 730          # never project more than two years ahead
AT_RISK_DAYS = 7        # up to a week late = "At risk", more = "Delayed"


def forecast_project(project, today=None):
    today = today or date.today()
    start, end = project.start_date, project.end_date
    progress = int(project.progress or 0)

    row = {
        "id": project.id,
        "name": project.name,
        "team": project.team,
        "progress": progress,
        "start_date": start,
        "end_date": end,
        "projected_finish": None,
        "days_late": None,
        "progress_at_deadline": None,
        "state": "",
        "note": "",
    }

    if progress >= 100 or project.status == "completed":
        row.update(state="Completed", note="Already finished.")
        return row

    if project.status == "on_hold":
        row.update(state="On hold", note="Project is on hold, so no finish date is projected.")
        return row

    if not start or not end or end <= start:
        row.update(state="No dates", note="Add a start date and an end date to get a forecast.")
        return row

    elapsed = (today - start).days
    if elapsed <= 0:
        row.update(state="Not started", note="The project has not reached its start date yet.")
        return row

    days_to_deadline = (end - today).days

    if progress == 0:
        row.update(
            state="Delayed" if days_to_deadline < 0 else "At risk",
            progress_at_deadline=0,
            note=f"No progress recorded after {elapsed} days.",
        )
        return row

    pace = progress / elapsed                       # percent per day so far
    days_needed = min(ceil((100 - progress) / pace), MAX_DAYS)
    finish = today + timedelta(days=days_needed)
    days_late = (finish - end).days
    at_deadline = min(100, round(progress + pace * max(days_to_deadline, 0)))

    if days_late <= 0:
        state = "On track"
        note = (
            f"Pace of {pace:.1f}% per day finishes about {abs(days_late)} days early."
            if days_late < 0
            else f"Pace of {pace:.1f}% per day finishes right on the deadline."
        )
    elif days_late <= AT_RISK_DAYS:
        state = "At risk"
        note = f"Pace of {pace:.1f}% per day finishes about {days_late} days late."
    else:
        state = "Delayed"
        note = f"Pace of {pace:.1f}% per day finishes about {days_late} days late."
    if days_to_deadline < 0:
        state = "Delayed"
        note = f"Deadline passed {abs(days_to_deadline)} days ago at {progress}% complete."

    row.update(
        projected_finish=finish,
        days_late=days_late,
        progress_at_deadline=at_deadline,
        state=state,
        note=note,
    )
    return row


def build_project_forecast(today=None):
    rows = [forecast_project(p, today) for p in Project.objects.all()]
    # Worst first: the latest projects at the top, then the ones without a date.
    rows.sort(key=lambda r: (r["days_late"] is None, -(r["days_late"] or 0), r["name"]))

    counts = {"On track": 0, "At risk": 0, "Delayed": 0, "Completed": 0}
    for r in rows:
        if r["state"] in counts:
            counts[r["state"]] += 1
    return {"summary": counts, "projects": rows}