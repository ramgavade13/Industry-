from fastapi import FastAPI

app = FastAPI(
    title="AI Executive Decision Agent",
    description="AI service for executive business decision support",
    version="1.0.0"
)


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