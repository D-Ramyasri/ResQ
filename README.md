# ResQ

ResQ is an emergency response coordination platform for turning citizen reports into a shared operational incident. It gives citizens, domain managers, responders, and command staff a common view of an emergency, while using Featherless AI to analyze the report context and recommend a coordinated response.

The application is designed as a hackathon-ready operational demo. The frontend contains the complete interactive experience, the local FastAPI service provides PostgreSQL-backed incidents and resources, and a Supabase Edge Function keeps the Featherless API key on the server side.

> ResQ is a demonstration system, not a replacement for emergency services, dispatch protocols, or professional medical, fire, rescue, or law-enforcement guidance.

## What ResQ Does

A typical incident moves through this sequence:

```text
Citizen report
    |
    v
Local incident created immediately
    |
    +--> FastAPI/PostgreSQL persistence
    |
    +--> Supabase Edge Function
              |
              v
        Featherless AI analysis
              |
              v
        Structured operational result
              |
              v
Existing ResQ dashboards, routing, approval, dispatch, ETA, and status tracking
```

The system supports:

- Citizen emergency reporting with category, description, location, image, and voice controls.
- Fire, medical, police, accident, and disaster manager dashboards.
- A system-wide Command Center.
- Incident prioritization and AI analysis display.
- Multi-domain routing, for example one crime incident reaching both police and medical managers.
- Resource recommendations and manager approval before dispatch.
- Resource status changes such as available, assigned, en route, arrived, and resolved.
- Live map views for incidents, resources, hospitals, and responder movement.
- Demo scenarios for crime plus medical response, multi-vehicle accidents, duplicate report fusion, and resource reallocation.
- A deterministic ResQ analysis engine used only as a fallback when the Featherless request fails.

## Current Architecture

### Frontend

The frontend is a React 19 single-page application built with Vite, TypeScript, and Tailwind CSS v4.

Important frontend locations:

- `src/main.tsx` mounts the application and imports global styles.
- `src/App.tsx` selects the active view and mounts the global overlays.
- `src/context/AppContext.tsx` owns application state, workflow transitions, demo data, notifications, approvals, and integration calls.
- `src/views/citizen/` contains citizen reporting and tracking screens.
- `src/views/responder/` contains domain-manager dashboards and incident details.
- `src/views/command/CommandCenter.tsx` contains the system-wide operations view.
- `src/components/LiveMap.tsx` renders the operational map.
- `src/components/DemoPanel.tsx` provides demo scenarios and role switching.
- `src/services/incidentAnalysis.ts` calls the Supabase Edge Function from the browser.
- `src/api.ts` calls the local FastAPI service at `http://127.0.0.1:8000`.

### Local FastAPI service

The `backend/` directory contains a separate FastAPI application using SQLAlchemy and PostgreSQL.

- `backend/main.py` exposes incident, resource, assignment, and health endpoints.
- `backend/models.py` defines the `incidents`, `resources`, and `assignments` ORM models.
- `backend/database.py` creates the PostgreSQL engine and session dependency.

The local backend is used by the frontend for loading and saving incidents and resources. Its default database connection is currently defined in `backend/database.py` and points to a local PostgreSQL database named `resq_db`.

### Supabase Edge Function

`supabase/functions/analyze-incident/index.ts` is the server-side AI boundary.

It:

1. Receives a category, description, location, and optional ETA context.
2. Reads `FEATHERLESS_API_KEY` from Supabase Edge Function secrets.
3. Calls `https://api.featherless.ai/v1/chat/completions`.
4. Uses the required model `deepseek-ai/DeepSeek-V3.2`.
5. Requests structured JSON.
6. Validates the returned severity, priority, urgency, hazards, domains, resources, summary, and responder guidance.
7. Returns the validated analysis to the frontend.

The key is never intended to be placed in React code, `.env.local`, `VITE_*` variables, browser requests, Git, logs, or UI text.

## Prerequisites

Install or make available:

- Node.js 22 or a compatible current Node.js release.
- npm or pnpm.
- Python 3.11 or newer.
- PostgreSQL if you want the local FastAPI service to run.
- Supabase CLI if you need to deploy or manage the Edge Function.
- A Featherless account and API key with access to `deepseek-ai/DeepSeek-V3.2`.

For the local backend, the Python packages used by the current code include:

- `fastapi`
- `uvicorn`
- `sqlalchemy`
- `psycopg[binary]`

If the environment does not already have them:

```bash
python -m pip install fastapi uvicorn sqlalchemy "psycopg[binary]"
```

## Frontend Setup

Install JavaScript dependencies from the repository root:

```bash
npm install
```

The repository also contains `pnpm-lock.yaml`. Use one package manager consistently for a given environment. Do not mix npm and pnpm lockfile updates casually.

Create `.env.local` in the repository root. Only public Supabase client values belong here:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

The frontend derives the Edge Function URL from `VITE_SUPABASE_URL`. An optional explicit override is supported:

```env
VITE_SUPABASE_FUNCTION_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1/analyze-incident
```

Do not add this variable with the literal value `YOUR_PROJECT_REF`; either replace it with the real project reference or omit the variable and let the frontend derive the URL.

Start the frontend:

```bash
npm run dev
```

Vite normally serves ResQ at:

```text
http://localhost:8443/
```

If port 8443 is unavailable, Vite may choose another port. Use the URL printed by the command.

## Local FastAPI and PostgreSQL Setup

The local backend expects PostgreSQL at:

```text
localhost:5432
```

The current connection string in `backend/database.py` expects:

```text
Database: resq_db
User: postgres
Password: the value configured in backend/database.py
```

For a real deployment, move this connection string to a server-side environment variable and rotate any credential that has been committed or shared. The current repository code is suitable for the local demo arrangement, not production secret management.

Create the database before starting the API. For example, from a PostgreSQL shell with sufficient privileges:

```sql
CREATE DATABASE resq_db;
```

Start FastAPI from the `backend` directory. Starting it from the repository root will fail because `main.py` uses local imports such as `from database import engine`.

```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

Check the service:

```text
http://127.0.0.1:8000/
http://127.0.0.1:8000/health
```

Expected health response:

```json
{"status":"healthy"}
```

The frontend can still load its built-in demo data if the local API is unavailable, but backend loading and persistence will not work until PostgreSQL and FastAPI are available.

## Supabase and Featherless Setup

The frontend does not call Featherless directly. The intended production path is:

```text
React browser
  -> Supabase Edge Function: analyze-incident
  -> Featherless chat completions API
```

### 1. Get the public Supabase values

In Supabase Dashboard, open **Project Settings -> API** and copy:

- Project URL into `VITE_SUPABASE_URL`.
- Publishable/anon key into `VITE_SUPABASE_ANON_KEY`.

The anon key is designed for client use. It is not the Featherless secret.

### 2. Authenticate and link the Supabase CLI

From the repository root:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

The project reference is the subdomain in the Supabase project URL. If this repository has no local `supabase/config.toml`, the `supabase link` command creates the local project linkage.

### 3. Store the Featherless key server-side

Create a key in Featherless through **Profile -> API Keys -> Create a new key**. Featherless keys normally begin with `fw-`.

Set it as a Supabase Edge Function secret:

```bash
npx supabase secrets set FEATHERLESS_API_KEY=fw-YOUR_FEATHERLESS_KEY
```

Do not put this value in `.env.local`, `VITE_*` variables, source files, README files, browser requests, or Git.

The same secret can be configured in Supabase Dashboard under the Edge Function secrets/settings area. The name must be exactly:

```text
FEATHERLESS_API_KEY
```

### 4. Deploy the existing function

Do not create a second AI function. Deploy the existing function:

```bash
npx supabase functions deploy analyze-incident
```

The function must be deployed to the same project referenced by `VITE_SUPABASE_URL`.

### 5. Test the deployed function

Use the public Supabase anon key for the Edge Function request. Never use the Featherless key in this command from a browser or frontend context.

Windows Command Prompt:

```cmd
curl -i -X POST "https://YOUR_PROJECT_REF.supabase.co/functions/v1/analyze-incident" ^
  -H "apikey: YOUR_SUPABASE_ANON_KEY" ^
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" ^
  -H "Content-Type: application/json" ^
  --data "{\"category\":\"crime\",\"description\":\"Someone attacked a person and their leg is bleeding badly. The attacker is still nearby.\"}"
```

A successful response should have HTTP status `200` and include:

```json
{
  "model": "deepseek-ai/DeepSeek-V3.2",
  "analysis": {
    "severity": "critical",
    "priority": "P1",
    "urgency": "immediate",
    "response_domains": ["police", "medical"]
  }
}
```

The exact model wording and list contents can vary. The Edge Function validates the structure before returning it.

Expected failure meanings:

- `401`: Featherless did not recognize the server key. Check the key or create a new one.
- `403`: The model is gated or unavailable to the account. Unlock access to `deepseek-ai/DeepSeek-V3.2`.
- `429`: Featherless rate limit was reached.
- `502`: The provider response was rejected, invalid, or unavailable.
- `503`: Temporary provider failure or the server secret is not configured.
- `504`: The provider request timed out.

The system must never silently switch to Groq, OpenRouter, OpenAI, Gemini, or another provider.

## AI Analysis Contract

The Edge Function sends the selected category as authoritative context. Featherless is asked to analyze the report context, not to replace the citizen's selected category.

The expected analysis shape is:

```json
{
  "severity": "critical|high|moderate|low",
  "priority": "P1|P2|P3|P4",
  "urgency": "immediate|urgent|soon|routine",
  "people_at_risk": 0,
  "hazards": [],
  "response_domains": [],
  "recommended_resource_types": [],
  "summary": "",
  "responder_guidance": {
    "police": [],
    "medical": [],
    "fire": [],
    "rescue": []
  }
}
```

The model can return multiple relevant response domains. For example, a crime report involving severe bleeding and an active threat should normally reach both police and medical teams.

Responder guidance is intended to be concise, non-tactical pre-arrival preparation. It must not replace professional protocols or provide dangerous instructions.

## Incident Workflow

### Citizen flow

1. Choose the Citizen role on the login screen.
2. Open the report flow.
3. Select a category.
4. Confirm or choose a location.
5. Add a description and optional evidence controls.
6. Submit the report.
7. Watch the processing screen.
8. Follow the active emergency view as the incident progresses.

### Manager flow

1. Choose Fire, Medical, Police, Accident, or Disaster Manager.
2. Open an active incident.
3. Review the AI analysis and recommended resources.
4. Approve the recommended resources.
5. Follow assignment, dispatch, en route, arrival, and resolution changes.

### Command flow

1. Choose Command Center.
2. Review the system-wide incident feed.
3. Use Live Map for the operational view.
4. Review Critical incidents, Resources, AI Alerts, and Analytics.
5. Select an incident to open its operational report.

### Demo panel

After entering a non-login view, the floating Demo control can trigger:

- Crime + Medical: demonstrates police and medical routing.
- Multi-Vehicle Accident: demonstrates multi-domain response.
- Duplicate Fusion: demonstrates the existing report-fusion animation.
- Dynamic Reallocation: demonstrates resource replacement when a recommendation becomes unavailable.

The demo panel can also switch roles without leaving the application.

## Backend API Reference

The local FastAPI service is currently hard-coded to `http://127.0.0.1:8000` in `src/api.ts`.

### Health

```http
GET /
GET /health
```

### Incidents

```http
GET /incidents
GET /incidents/{incident_id}
POST /incidents?description=...&latitude=...&longitude=...&priority=medium
PATCH /incidents/{incident_id}/status?status=assigned
```

### Resources

```http
GET /resources
GET /resources/available
POST /resources?name=...&resource_type=...&latitude=...&longitude=...
PATCH /resources/{resource_id}/status?status=en_route
```

### Assignments

```http
POST /assign?incident_id=...&resource_id=...
```

The assignment endpoint checks that both records exist and that the selected resource is available before creating an assignment and marking the incident and resource as assigned.

## Data and State Boundaries

There are currently two data paths in the application:

1. Demo and UI state is held in `AppContext` and initialized from `src/data/mockData.ts`.
2. Incidents and resources are also loaded/saved through the local FastAPI/PostgreSQL service when it is available.

The Featherless analysis result is returned through the Supabase Edge Function and applied to the in-memory incident object. The current repository does not yet contain a dedicated Supabase database schema or a Supabase write-back for the full AI analysis document. This distinction matters:

- Featherless analysis integration is real and server-side.
- Local FastAPI persistence is real when PostgreSQL is running.
- Full Supabase report plus AI-analysis persistence is not yet complete.
- A browser refresh can still lose parts of the UI/demo state.

The map is a display layer. It does not perform AI analysis and does not decide routing.

## Fallback Behavior

A report receives an initial deterministic analysis so the UI can continue if the provider is unavailable. That initial result is marked:

```text
analysisSource: resq_fallback
```

When the Edge Function returns valid Featherless output, the same incident is updated with the model-derived result and marked:

```text
analysisSource: featherless
```

The fallback is used for conditions such as:

- Missing Supabase function configuration.
- Missing Supabase anon key.
- Featherless authentication failure.
- Gated or unavailable model.
- Rate limiting.
- Provider errors.
- Timeout.
- Empty or invalid model JSON.

The frontend should not describe fallback output as Featherless output.

## Verification Checklist

Run the following checks before a demo:

```bash
npm run build
```

Then confirm:

- The frontend opens at the Vite URL.
- The FastAPI health endpoint returns healthy if local persistence is being used.
- The Supabase Edge Function is deployed and ACTIVE.
- `FEATHERLESS_API_KEY` exists as a Supabase Edge Function secret.
- A direct Edge Function request returns HTTP `200`.
- The response model is `deepseek-ai/DeepSeek-V3.2`.
- The crime test returns broadly critical/P1/immediate analysis.
- Police and medical appear in the response domains for the crime test.
- The browser does not contain the Featherless key.
- A citizen report reaches processing and active response views.
- A manager can review and approve resources.
- The Command Center can see the incident.
- The map displays locations and status without making routing decisions.
- A failed provider request remains clearly marked as `resq_fallback`.

## Troubleshooting

### The frontend is blank

Check the browser console and restart Vite. Confirm that the active view and role are valid. Run:

```bash
npm run build
```

The app must be started from the repository root for Vite aliases and environment loading to work.

### The FastAPI service will not start

Start it from `backend/`:

```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

If you see `ModuleNotFoundError: No module named 'psycopg'`, install:

```bash
python -m pip install "psycopg[binary]"
```

If startup hangs or fails while connecting to PostgreSQL, start PostgreSQL and verify that `resq_db` exists and that the credentials in `backend/database.py` are correct.

### The frontend reports backend fetch failures

The local API is optional for displaying built-in demo data, but backend incidents and resources require FastAPI on port 8000. Check:

```text
http://127.0.0.1:8000/health
```

Also check that the frontend origin is one of the allowed CORS origins in `backend/main.py`.

### The Edge Function returns 401

The Featherless key is missing, expired, malformed, or not recognized. Replace the Supabase secret without displaying it:

```bash
npx supabase secrets set FEATHERLESS_API_KEY=fw-YOUR_FEATHERLESS_KEY
npx supabase functions deploy analyze-incident
```

### The Edge Function returns 403

The requested model is gated. Unlock `deepseek-ai/DeepSeek-V3.2` in Featherless for the account associated with the key. Do not replace the model or provider.

### The Edge Function is never called

Check that `.env.local` contains:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

If `VITE_SUPABASE_FUNCTION_URL` is present, verify that it does not still contain `YOUR_PROJECT_REF`.

Restart Vite after changing environment variables. Vite reads them when the development server starts.

## Project Scripts

```bash
npm run dev       # Start the Vite development server
npm run build     # Create a production build
npm run preview   # Serve the production build locally
npm run format    # Format files with oxfmt
```

There is currently no dedicated `test` or `typecheck` script in `package.json`. The production build is the primary automated frontend validation command.

## Repository Layout

```text
.
├── backend/
│   ├── database.py              PostgreSQL and SQLAlchemy session setup
│   ├── main.py                  FastAPI routes
│   └── models.py                Incident, resource, and assignment models
├── member4/                     Supporting allocation/map utilities and tests
├── src/
│   ├── components/              Shared UI components and map
│   ├── context/                 Global application state and workflow logic
│   ├── data/                    Demo users, incidents, resources, and alerts
│   ├── services/                Supabase Edge Function client
│   ├── views/                   Citizen, responder, and command screens
│   ├── api.ts                   Local FastAPI client
│   ├── App.tsx                  Application view switcher
│   ├── index.css                Theme, typography, animation, and global styles
│   ├── main.tsx                 React entrypoint
│   └── types.ts                 Shared TypeScript domain types
├── supabase/
│   └── functions/
│       └── analyze-incident/    Featherless server-side integration
├── .env.example                 Public environment variable template
├── package.json                 Frontend scripts and dependencies
├── tsconfig.json                TypeScript configuration
└── vite.config.ts               Vite and Tailwind configuration
```

## Security Notes

- Treat the Featherless key as a server secret.
- Never use `VITE_FEATHERLESS_API_KEY`; all `VITE_*` values are exposed to the browser bundle.
- Never commit `.env.local` or any file containing a real secret.
- Use the Supabase anon key only for the browser-to-Supabase request.
- Restrict Edge Function access and add rate limiting/authentication before production use.
- Move the local PostgreSQL password out of source before deploying the FastAPI service.
- Do not log full authorization headers or provider response data that might contain sensitive report information.

## License and Ownership

No license file is currently included in the repository. Add the appropriate project license before distributing the application outside the intended hackathon or team context.
