# AI Executive Decision Agent

A web app that gives a company's leaders one place to see KPIs, project risks, forecasts and
AI recommendations, and to ask questions in plain language by text or voice. What each person
can see depends on their role.

**Stack:** Django 5 + Django REST Framework + PostgreSQL (backend), Next.js (frontend),
Google Gemini for the AI answers, scikit-learn for the risk model.

## Roles

| Role | Can use |
|---|---|
| CEO | Everything: KPIs, financials, risks, productivity, forecasts, recommendations, reports, chat, voice |
| Admin | Same as CEO, plus user management |
| Manager | Projects, tasks, teams, KPIs, risks, productivity, KPI and Risk reports, chat, voice |
| Employee | Own tasks and projects, chat and voice (own data only), profile |

## What you need first

- Python 3.10 or newer
- Node.js 20 or newer
- PostgreSQL, with a database user that is allowed to create databases (needed for the tests)
- A Gemini API key (free from Google AI Studio). Without it the chat still works, but answers
  come straight from the database instead of the AI.

## Backend setup

Run these in PowerShell from the repo root.

```powershell
cd backend
python -m venv Venv
.\Venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

Open `backend\.env` and fill in your PostgreSQL password and your Gemini key. Then create an
empty PostgreSQL database with the name you set in `DB_NAME` (default `executive_agent`).

Create the tables and the demo data. **Run these five commands in exactly this order:**

```powershell
python manage.py migrate
python manage.py seed_demo
python manage.py seed_schema_demo
python manage.py seed_project_data
python manage.py run_ai_all
```

> Do not run `seed_schema_demo` again after `seed_project_data`. It resets the project data.
> `run_ai_all` fills the risk alerts, the revenue forecast and the AI recommendations. Run it
> again whenever you change project data and want fresh results.

Start the server:

```powershell
python manage.py runserver
```

The API runs at http://127.0.0.1:8000.

## Frontend setup

Open a second PowerShell window.

```powershell
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

Open http://localhost:3000. `NEXT_PUBLIC_API_URL` in `.env.local` must point at the backend
(default `http://127.0.0.1:8000`).

## Demo logins

All demo accounts use the password `Demo@1234` (capital D).

| Username | Role |
|---|---|
| `ceo_demo` | CEO |
| `admin_demo` | Admin |
| `manager_demo` | Manager |
| `amit_demo` | Employee |

## Features

- **Dashboard and KPIs:** cards calculated from the database (growth, profit margin, task
  completion, budget variance, projects at risk).
- **Projects and tasks:** add, edit and delete with validation; managers assign tasks,
  employees update their own task status.
- **Risk:** a machine-learning model scores every project Low, Medium or High and explains why.
- **Forecasting:** revenue and expense forecast, plus a project-progress forecast that
  estimates each project's finish date from its pace so far.
- **AI recommendations:** CEO and Admin can accept or dismiss each one; decisions are saved.
- **Reports:** Executive, KPI, Financial and Risk reports as PDF or Word (Word via
  `?output=docx`).
- **Chat and voice:** ask questions in plain language; answers only use data the logged-in
  role may see. Chats are saved per user.
- **Users:** admins add and edit users; everyone has a profile page and can change their
  password.

## AI module (`ai/`)

The `ai/` folder is a separate Python module with the AI work behind the project: AI agents
(financial, risk, productivity, recommendations, executive), forecasting, a trained risk
model, document Q&A (RAG) and a voice assistant, plus a small FastAPI service.

The web app above does not need this module to run. Its dashboards, risk scores, forecasts,
chat and voice all work from the Django backend. See `ai/README.md` for the folder structure
and the libraries it uses.

## Running the tests

```powershell
cd backend
python manage.py test accounts
```

## Notes

- All demo data is sample data. The 15 projects, 32 tasks, users and 6 months of revenue are
  seeded.
- Gemini has a free daily limit. When it is reached, the chat falls back to answers taken
  directly from the database and says so.
- Never commit `.env`, `.env.local` or `risk_model.joblib`.