# AI Executive Decision Agent

## 1. Project Overview

The AI Executive Decision Agent is an AI-powered decision-support
system designed to help business executives make better decisions.

The system analyzes financial performance, project risks, employee
productivity, and business data.

It combines the analysis into an executive report with useful
insights and recommendations.

## 2. Project Objectives

The main objectives are:

- Analyze financial performance.
- Identify project risks.
- Monitor productivity.
- Forecast revenue and project outcomes.
- Generate business recommendations.
- Answer questions about project documents.
- Support voice input and spoken responses.
- Help executives make data-driven decisions.

## 3. Technology Stack

### Programming Language

- Python

### Data Analysis

- Pandas
- NumPy

### Machine Learning

- Scikit-learn
- XGBoost
- Joblib

### Generative AI

- Google Gemini API

### AI Workflow

- LangGraph
- LangChain Core

### Document Search

- ChromaDB
- Retrieval-Augmented Generation (RAG)

### Voice Assistant

- SpeechRecognition
- OpenAI Whisper
- pyttsx3
- gTTS

### Configuration

- Python dotenv

## 4. Project Structure

```text
ai/
├── agents/
│   ├── __init__.py
│   ├── financial_agent.py
│   ├── project_risk_agent.py
│   ├── productivity_agent.py
│   ├── recommendation_agent.py
│   └── executive_agent.py
│
├── data/
│   ├── projects.csv
│   ├── tasks.csv
│   ├── financials.csv
│   └── kpi_history.csv
│
├── data_processing/
│   ├── preprocessing.py
│   └── kpi_calculations.py
│
├── forecasting/
│   ├── revenue_forecast.py
│   └── project_forecast.py
│
├── risk_prediction/
│   ├── features.py
│   ├── train_model.py
│   └── predict.py
│
├── rag/
│   ├── __init__.py
│   ├── document_loader.py
│   ├── chroma_client.py
│   ├── retrieval.py
│   ├── answer_generator.py
│   └── query_engine.py
│
├── voice/
│   ├── __init__.py
│   ├── speech_to_text.py
│   ├── text_to_speech.py
│   └── voice_assistant.py
│
├── config.py
├── requirements.txt
├── .env.example
└── README.md
```
