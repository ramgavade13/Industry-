"""
Forecasts when each project will actually finish, based on its CURRENT
pace of progress -- not just the original deadline.

Assumption: progress has been building up roughly evenly since the project
started. We don't have a stored start_date in projects.csv yet, so this
version estimates pace from (progress / assumed_elapsed_days). Once the
backend has a real start_date column, swap it in here -- nothing else
needs to change.
"""

import os
import sys
import pandas as pd

sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data_processing"))
from preprocessing import load_projects  # noqa: E402

ASSUMED_ELAPSED_DAYS = 30


def forecast_completion(projects_df: pd.DataFrame = None, assumed_elapsed_days: int = ASSUMED_ELAPSED_DAYS) -> pd.DataFrame:
    df = projects_df if projects_df is not None else load_projects()
    df = df.copy()

    df["pace_per_day"] = (df["progress"] / assumed_elapsed_days).round(3)
    remaining_progress = 100 - df["progress"]

    safe_pace = df["pace_per_day"].replace(0, 0.01)
    df["days_needed"] = (remaining_progress / safe_pace).round(0)

    df["will_finish_late"] = df["days_needed"] > df["deadline_days"]
    df["days_late"] = (df["days_needed"] - df["deadline_days"]).clip(lower=0).round(0)

    cols = ["project_id", "project_name", "progress", "deadline_days", "days_needed", "will_finish_late", "days_late"]
    return df[cols].sort_values("will_finish_late", ascending=False).reset_index(drop=True)


if __name__ == "__main__":
    forecast = forecast_completion()
    late = forecast[forecast["will_finish_late"]]
    print(f"{len(late)} of {len(forecast)} projects are forecast to finish LATE at current pace:\n")
    print(late.to_string(index=False))