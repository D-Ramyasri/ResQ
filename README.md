# 🚨 RESQ --- Intelligent Emergency Response & Coordination Platform

> **From a citizen's first report to coordinated emergency response ---
> RESQ turns fragmented emergency information into one operational
> picture.**

RESQ is an emergency-response coordination platform designed to help
citizens, responders, resource managers, and command teams work from the
same incident picture.

Instead of treating an emergency report as an isolated message, RESQ
combines **incident context analysis, multi-agency routing, incident
fusion, proximity-aware resource allocation, live status tracking, and
responder coordination** into a single workflow.

------------------------------------------------------------------------

## 🎯 The Problem

Emergency response often becomes difficult not because information is
unavailable, but because it is **fragmented, delayed, and difficult to
coordinate**.

A real incident may generate:

-   multiple citizen reports about the same event
-   incomplete or inconsistent descriptions
-   several agencies that need to respond
-   limited ambulances, fire trucks, police units, or rescue teams
-   rapidly changing resource availability
-   uncertainty about which unit should respond first

A response platform therefore needs to answer more than:

> **"What happened?"**

It also needs to answer:

> **"How serious is it, who needs to respond, which resources are
> available, and which resources should be sent?"**

------------------------------------------------------------------------

## 💡 Our Solution

RESQ creates a shared operational workflow:

``` text
Citizen Report
      ↓
Incident Context Analysis
      ↓
Severity + Priority + Hazards
      ↓
Multi-Agency Routing
      ↓
Resource Requirements
      ↓
Nearest Available Resource Matching
      ↓
Human Approval
      ↓
Dispatch / En Route / Arrived
      ↓
Incident Resolution
```

The key design principle is:

> **AI provides incident context and resource requirements; the
> deterministic resource engine decides which available units should
> actually be allocated.**

This separation makes the response workflow easier to understand, test,
and control.

------------------------------------------------------------------------

# ⭐ What Makes RESQ Different?

### 1. Context-aware AI, not just incident classification

RESQ sends the selected incident category, description, location, and
ETA context to an AI analysis service.

The AI produces structured operational context including:

-   severity
-   priority
-   urgency
-   people at risk
-   hazards
-   response domains
-   recommended resource types
-   concise incident summary
-   responder guidance

The AI response is validated against an explicit schema before being
accepted.

**Important:** AI does not directly assign database resources.

------------------------------------------------------------------------

### 2. AI + deterministic resource allocation

This is one of RESQ's core design decisions.

``` text
AI
 │
 └── "2 fire trucks + 1 ambulance are required"
                    ↓
        Resource Allocation Engine
                    ↓
        "Which available units?"
                    ↓
        Nearest eligible resources
```

The allocation engine:

1.  filters resources by availability
2.  filters them by required resource type
3.  calculates distance
4.  sorts eligible resources by distance
5.  selects the required number of units
6.  reports any unfulfilled requirement

This avoids making resource assignment depend entirely on an AI
decision.

------------------------------------------------------------------------

### 3. Multi-agency coordination

A single incident can involve multiple response domains.

RESQ supports:

-   🔥 Fire
-   🚑 Medical
-   👮 Police
-   🚗 Accident response
-   🌪️ Disaster response

An incident can therefore be routed to multiple responsible teams
instead of forcing emergency coordination into a single-agency workflow.

------------------------------------------------------------------------

### 4. Duplicate-report / incident fusion

The platform includes an incident-fusion workflow for situations where
several citizens report the same emergency.

Instead of treating:

``` text
Report A
Report B
Report C
```

as three unrelated incidents, RESQ demonstrates how related reports can
be consolidated into:

``` text
             ONE UNIFIED INCIDENT
                     ↓
              Better context
                     ↓
            Better prioritization
                     ↓
          Coordinated response
```

The demo timeline records the fusion and escalation process so command
users can understand how the incident evolved.

------------------------------------------------------------------------

### 5. Proximity-aware allocation

When multiple eligible resources exist, RESQ prefers the nearest
available units.

For example:

``` text
Incident
   ●
  / \
 /   \
🚑 A01   🚑 A04
  1.2 km   3.4 km

        ↓

Select A01 first
```

This is particularly important in emergency response, where reducing
unnecessary travel distance can improve response efficiency.

------------------------------------------------------------------------

### 6. Human-in-the-loop dispatch

RESQ does not automatically turn an AI recommendation into an
irreversible dispatch.

The workflow includes an **approval stage**:

``` text
AI Analysis
     ↓
Recommended response
     ↓
Command / manager review
     ↓
Approve
     ↓
Resource allocation
     ↓
Dispatch
```

This keeps a responsible human decision-maker in the operational loop.

------------------------------------------------------------------------

### 7. One incident timeline

Each incident maintains a timeline of important events such as:

-   citizen report
-   location verification
-   AI analysis
-   agency routing
-   resource approval
-   dispatch
-   responders en route
-   arrival
-   resolution

This provides a simple operational history rather than forcing users to
reconstruct what happened from separate messages.

------------------------------------------------------------------------

# 🏗️ System Architecture

``` text
                         ┌─────────────────────┐
                         │      Citizen        │
                         │   Report / Location │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   React Frontend    │
                         │ Dashboards + Maps   │
                         └───────┬─────┬───────┘
                                 │     │
                   AI analysis   │     │ Incident / Resource API
                                 │     │
                                 ▼     ▼
                    ┌──────────────┐  ┌──────────────────┐
                    │   Supabase   │  │     FastAPI      │
                    │ Edge Function│  │ Backend API      │
                    └──────┬───────┘  └────────┬─────────┘
                           │                   │
                           ▼                   ▼
                    ┌──────────────┐   ┌──────────────────┐
                    │ Featherless  │   │   PostgreSQL     │
                    │ AI / DeepSeek│   │ incidents        │
                    └──────────────┘   │ resources        │
                                       │ assignments      │
                                       └──────────────────┘

                         ┌─────────────────────┐
                         │ Resource Engine     │
                         │                     │
                         │ availability        │
                         │ resource type       │
                         │ distance            │
                         │ nearest matching    │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Dispatch / Status   │
                         │ assigned → en route │
                         │ → arrived → resolved│
                         └─────────────────────┘
```

------------------------------------------------------------------------

# 🧠 AI Architecture

RESQ uses a Supabase Edge Function as the server-side AI gateway.

The Edge Function calls:

**Featherless AI** - Model: `deepseek-ai/DeepSeek-V3.2`

The AI is instructed to return structured JSON rather than free-form
text.

The response is validated for:

-   severity
-   priority
-   urgency
-   people at risk
-   hazards
-   response domains
-   recommended resource types
-   summary
-   responder guidance

This creates a predictable interface between the AI layer and the rest
of the application.

### AI safety boundary

The AI is used for **context analysis and recommendations**.

It is explicitly not responsible for:

-   directly modifying resources
-   directly creating database assignments
-   bypassing human approval
-   replacing professional emergency protocols

------------------------------------------------------------------------

# 🗺️ Resource Allocation Engine

The resource engine is implemented separately from the AI service.

Supported resource types include:

-   `ambulance`
-   `fire_truck`
-   `police`
-   `rescue`

The engine accepts a requirement such as:

``` text
2 × Fire Truck
1 × Ambulance
1 × Police Unit
```

and converts it into structured requirements:

``` text
fire_truck: 2
ambulance: 1
police: 1
```

It then selects the nearest available eligible resources.

If enough resources do not exist, the engine returns an **unfulfilled
requirement** instead of silently pretending that the full response is
possible.

------------------------------------------------------------------------

# 🗄️ Backend & Database

RESQ includes a FastAPI backend backed by PostgreSQL through SQLAlchemy.

### Database entities

#### `incidents`

Stores:

-   incident description
-   latitude
-   longitude
-   status
-   priority
-   creation timestamp

#### `resources`

Stores:

-   resource name
-   resource type
-   latitude
-   longitude
-   availability/status

#### `assignments`

Connects incidents with resources and stores:

-   incident ID
-   resource ID
-   assignment status
-   assignment timestamp

### Backend API

  Method   Endpoint                   Purpose
  -------- -------------------------- ----------------------------------
  GET      `/`                        Backend health/message
  GET      `/health`                  Health check
  POST     `/incidents`               Create an incident
  GET      `/incidents`               List incidents
  GET      `/incidents/{id}`          Get one incident
  PATCH    `/incidents/{id}/status`   Update incident status
  POST     `/resources`               Create a resource
  GET      `/resources`               List resources
  GET      `/resources/available`     List available resources
  PATCH    `/resources/{id}/status`   Update resource status
  POST     `/assign`                  Assign a resource to an incident

FastAPI also exposes interactive API documentation at:

``` text
http://127.0.0.1:8000/docs
```

------------------------------------------------------------------------

# 🖥️ User Roles

RESQ provides role-specific interfaces for:

  Role       Responsibility
  ---------- -------------------------------------------------
  Citizen    Submit and track emergencies
  Fire       View fire-related incidents
  Medical    View medical incidents and response information
  Police     View police-related incidents
  Accident   Handle accident-domain incidents
  Disaster   Handle disaster-domain incidents
  Command    Coordinate incidents, resources, and approvals

------------------------------------------------------------------------

# ✨ Main Product Features

### Citizen Experience

-   Emergency reporting
-   Category selection
-   Location capture / confirmation
-   Description, image and voice report fields
-   Processing state
-   Active emergency tracking

### Command Center

-   Unified incident view
-   Priority and severity visibility
-   Affected response domains
-   Incident timeline
-   Resource assignment
-   AI alerts
-   Incident fusion demonstration
-   Resource reallocation demonstration

### Responder Experience

-   Domain-specific incident information
-   Incident details
-   Response status
-   Responder guidance
-   Operational timeline

### Resource Operations

-   Resource availability tracking
-   Resource type matching
-   Distance-aware allocation
-   Assignment status
-   Resource release
-   Partial-allocation / shortage indication

------------------------------------------------------------------------

# 📁 Project Structure

``` text
RESQ/
│
├── src/
│   ├── App.tsx
│   ├── api.ts
│   ├── types.ts
│   │
│   ├── components/
│   │   ├── DemoPanel.tsx
│   │   ├── FusionDemoOverlay.tsx
│   │   ├── LiveLocationPicker.tsx
│   │   ├── LiveMap.tsx
│   │   ├── Shared.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── ToastSystem.tsx
│   │
│   ├── context/
│   │   └── AppContext.tsx
│   │
│   ├── data/
│   │   └── mockData.ts
│   │
│   ├── services/
│   │   └── incidentAnalysis.ts
│   │
│   ├── utils/
│   │   └── resourceEngine.ts
│   │
│   └── views/
│       ├── LoginView.tsx
│       ├── citizen/
│       ├── command/
│       └── responder/
│
├── backend/
│   ├── database.py
│   ├── main.py
│   └── models.py
│
├── member4/
│   ├── data/
│   ├── map/
│   └── utils/
│
├── supabase/
│   └── functions/
│       └── analyze-incident/
│           └── index.ts
│
├── package.json
├── package-lock.json
└── pnpm-lock.yaml
```

------------------------------------------------------------------------

# 🛠️ Tech Stack

### Frontend

-   React 19
-   TypeScript
-   Vite
-   Tailwind CSS

### AI

-   Featherless AI
-   DeepSeek-V3.2
-   Supabase Edge Function as the AI gateway

### Backend

-   Python
-   FastAPI
-   SQLAlchemy
-   PostgreSQL
-   psycopg

### Core Algorithms

-   nearest-resource matching
-   distance calculation
-   availability filtering
-   requirement parsing
-   resource assignment/release
-   incident fusion workflow

------------------------------------------------------------------------

# 🚀 Getting Started

## 1. Clone the repository

``` bash
git clone <repository-url>
cd RESQ
```

## 2. Install frontend dependencies

``` bash
npm install
```

## 3. Start the frontend

``` bash
npm run dev
```

The Vite development server will display the local URL in the terminal.

------------------------------------------------------------------------

## 4. Configure the AI service

The frontend AI integration expects:

``` text
VITE_SUPABASE_FUNCTION_URL
VITE_SUPABASE_ANON_KEY
```

The function URL should point to the deployed `analyze-incident`
Supabase Edge Function.

The Edge Function requires the server-side secret:

``` text
FEATHERLESS_API_KEY
```

Do **not** expose the Featherless API key in frontend code.

------------------------------------------------------------------------

## 5. Configure PostgreSQL

The FastAPI backend expects a PostgreSQL database named:

``` text
resq_db
```

The backend database connection is defined in:

``` text
backend/database.py
```

Before production use, move database credentials into environment
variables and never commit real passwords or secrets to Git.

Install the required Python packages for the backend, then run:

``` bash
cd backend
python -m uvicorn main:app --reload
```

The backend will be available at:

``` text
http://127.0.0.1:8000
```

Interactive API documentation:

``` text
http://127.0.0.1:8000/docs
```

------------------------------------------------------------------------

# ▶️ Recommended Demo Flow

For a strong project demonstration:

### Step 1 --- Citizen

Log in as a citizen and submit an emergency.

Show:

``` text
Category
↓
Location
↓
Description
↓
Report submitted
```

### Step 2 --- AI Analysis

Show the processing stage and explain that RESQ sends incident context
to the AI service.

Highlight:

-   severity
-   priority
-   urgency
-   hazards
-   people at risk
-   response domains
-   resource requirements

### Step 3 --- Command Center

Open the incident in the Command Center.

Show how one incident becomes a shared operational picture.

### Step 4 --- Resource Decision

Explain:

> "The AI identifies what kind of response is required. Our
> deterministic allocation engine then chooses the nearest available
> units."

Show the selected resources.

### Step 5 --- Approval & Dispatch

Approve the response and show the transition:

``` text
Awaiting Approval
       ↓
Assigned
       ↓
En Route
       ↓
Arrived
       ↓
Resolved
```

### Step 6 --- Explain the real-world value

Close with:

> **"RESQ is designed to reduce coordination overhead during the most
> time-sensitive moments --- turning fragmented reports into a
> structured incident and helping teams make faster, more informed
> resource decisions."**

------------------------------------------------------------------------

# 🌍 Real-World Impact

RESQ is designed around a practical emergency-response problem:
**coordination under time pressure**.

Potential real-world benefits include:

### Faster information synthesis

Instead of manually reading and comparing multiple reports, command
teams receive structured incident context.

### Better resource utilization

Nearest-resource matching can reduce unnecessary travel and make limited
emergency resources easier to allocate.

### Reduced information fragmentation

Citizens, command teams, and responders work from the same incident
representation.

### Cross-agency coordination

A single incident can involve medical, fire, police, accident, and
disaster response domains.

### Better operational transparency

The incident timeline records important decisions and status changes,
helping teams understand how an emergency evolved.

### Graceful handling of shortages

When the requested number of resources is unavailable, RESQ exposes the
unfulfilled requirement rather than hiding the shortage.

> **The goal is not simply to build another emergency reporting app. The
> goal is to build a coordination layer between information,
> intelligence, resources, and human decision-making.**

------------------------------------------------------------------------

# 🔐 Responsible AI & Operational Boundaries

RESQ is designed as a decision-support and coordination prototype.

The AI:

-   produces structured incident context
-   identifies hazards and urgency
-   recommends resource types
-   provides concise responder guidance

The system does **not** treat AI output as an autonomous dispatch
authority.

Human approval remains part of the response workflow.

The AI prompt also instructs the model that responder guidance must be
safe, non-tactical pre-arrival preparation and must not replace
professional emergency protocols.

------------------------------------------------------------------------

# 🧪 Testing

The repository contains multiple tests for the resource-management
subsystem, including:

``` text
member4/utils/testAllocation.js
member4/utils/testAllocationEngine.js
member4/utils/testAssignmentFormatter.js
member4/utils/testDistance.js
member4/utils/testMapDataFormatter.js
member4/utils/testMultipleIncidents.js
member4/utils/testReleaseResources.js
member4/utils/testResourceFilter.js
member4/utils/testResourceManager.js
member4/utils/testResourceMatcher.js
member4/utils/testResourceStatus.js
member4/utils/testScenarios.js
```

These cover resource filtering, distance calculation, matching,
allocation, assignment formatting, status management, release behavior,
and multiple-incident scenarios.

------------------------------------------------------------------------

# ⚠️ Prototype / Development Notes

RESQ is currently a hackathon/prototype implementation.

Some operational data is represented through demo/mock data so the
complete user experience can be demonstrated without a live
emergency-services infrastructure.

The repository also contains:

-   a local PostgreSQL/FastAPI backend
-   a Supabase Edge Function for AI analysis
-   demo scenarios for incident fusion and resource reallocation
-   simulated response progression for demonstration purposes

For production deployment, the platform would require additional work
such as:

-   secure authentication and authorization
-   production-grade secret management
-   encrypted communications
-   real emergency-service integrations
-   authoritative GIS / routing data
-   real-time event infrastructure
-   stronger audit controls
-   reliability and observability
-   formal emergency-service validation
-   comprehensive security and privacy review

------------------------------------------------------------------------

# 🚀 Future Vision

RESQ can evolve toward a city-scale emergency coordination layer with:

-   real-time emergency-service integrations
-   live GIS routing and traffic-aware ETA
-   real-time responder location
-   hospital capacity integration
-   richer multimodal incident evidence
-   predictive resource positioning
-   city-wide incident heatmaps
-   stronger duplicate-incident detection
-   resilient offline / low-connectivity operation
-   advanced operational analytics

------------------------------------------------------------------------

# 🏆 Why RESQ Matters

Emergency response is ultimately a race against time.

RESQ focuses on the part between **receiving information** and
**coordinating the right response**.

Its core idea is simple:

``` text
More structured information
          +
Better incident intelligence
          +
Smarter resource selection
          +
Human oversight
          =
Better coordinated emergency response
```

**RESQ --- turning emergency signals into coordinated action.**
