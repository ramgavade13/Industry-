from fastapi import FastAPI
from pydantic import BaseModel

from risk_prediction.model import predict_risk


app = FastAPI(
    title="AI Executive Decision Agent",
    description="AI service for executive business decision support",
    version="1.0.0"
)


class RiskPredictionRequest(BaseModel):
    progress_percentage: float
    budget_used_percentage: float
    days_remaining: int
    delayed_tasks: int
    total_tasks: int


@app.get("/")
def home():
    return {
        "message": "AI Executive Decision Agent is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/risk-prediction")
def risk_prediction(request: RiskPredictionRequest):

    risk = predict_risk(
        progress_percentage=request.progress_percentage,
        budget_used_percentage=request.budget_used_percentage,
        days_remaining=request.days_remaining,
        delayed_tasks=request.delayed_tasks,
        total_tasks=request.total_tasks,
    )

    return {
        "risk": risk
    }
