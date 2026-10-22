
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
import traceback

from risk_prediction.model import predict_risk
from agents.executive_agent import run_executive_agent


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
    try:
        risk = predict_risk(
            progress_percentage=request.progress_percentage,
            budget_used_percentage=request.budget_used_percentage,
            days_remaining=request.days_remaining,
            delayed_tasks=request.delayed_tasks,
            total_tasks=request.total_tasks,
        )

        return {
            "status": "success",
            "risk": risk
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Risk prediction failed: {str(error)}"
        )


@app.get("/api/executive-analysis")
def executive_analysis(
    use_ai: bool = Query(
        default=False,
        description="Enable AI-generated recommendations"
    )
):
    try:
        report = run_executive_agent(use_ai=use_ai)

        return report

    except Exception as error:
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=f"Executive analysis failed: {str(error)}"
        )
