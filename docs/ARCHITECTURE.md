# VisionPath AI — Architecture & Workflow

This document describes how the system is put together: the high-level architecture, the main
request/data flows, the database schema, and the technologies behind each layer. It complements
the feature overview in the root [README.md](../README.md).

> **Status note:** the codebase is a work in progress. Several pieces described in the README and
> wired into `backend/main.py` are not yet implemented in this checkout — see
> [Implementation Status](#implementation-status) at the end of this document for exactly what
> exists today versus what is scaffolded/planned.

---

## 1. System Architecture

```mermaid
flowchart TB
    subgraph Client["Client (Browser)"]
        UI["Next.js App Router UI<br/>React 18 + TypeScript + Tailwind"]
        SW["Web Speech API<br/>(voice recognition / TTS)"]
        Leaflet["Leaflet / react-leaflet<br/>(campus + indoor maps)"]
    end

    subgraph Frontend["Frontend Service (frontend/)"]
        Pages["App Router Pages<br/>login · register · onboarding · dashboard/*"]
        Ctx["React Contexts<br/>AuthContext · AccessibilityContext · VoiceContext"]
        ApiClient["ApiClient (axios wrapper)<br/>services/api.ts"]
    end

    subgraph Backend["Backend Service (backend/) — FastAPI"]
        Main["main.py<br/>FastAPI app + CORS + router registration"]
        AuthR["auth router<br/>/api/auth/*"]
        OtherR["users / navigation / ocr / emergency /\nnotifications / admin / voice / dashboard routers\n(referenced by main.py, not yet present)"]
        AuthSvc["AuthService<br/>JWT issuing/verification, bcrypt hashing,\nFirebase token verification"]
        ORM["SQLAlchemy ORM Models<br/>User · Building · Floor · Facility ·\nNavigationDestination · Emergency · Notification"]
    end

    subgraph Data["Data & Infra"]
        PG[("PostgreSQL 16\nprimary datastore")]
        Redis[("Redis 7\ncaching / task queue")]
        Firebase["Firebase Auth\n(Google sign-in)"]
    end

    UI --> Pages
    Pages --> Ctx
    Ctx --> ApiClient
    SW --> Ctx
    Leaflet --> Pages

    ApiClient -- "HTTPS JSON\nBearer JWT" --> Main
    Main --> AuthR
    Main -. "included but missing from repo" .-> OtherR
    AuthR --> AuthSvc
    AuthSvc --> ORM
    ORM --> PG
    AuthSvc -. "Google token verify" .-> Firebase
    Main -. "planned" .-> Redis

    classDef missing stroke-dasharray: 5 5,color:#888;
    class OtherR missing;
```

**Deployment topology** (`docker-compose.yml`):

```mermaid
flowchart LR
    Dev["Developer / CI"] -->|docker-compose up --build| Compose

    subgraph Compose["Docker Compose stack"]
        FE["frontend container\nnode:20 → next start\nport 3000"]
        BE["backend container\npython → uvicorn/gunicorn\nport 8000"]
        PGC["postgres:16-alpine\nport 5432"]
        RC["redis:7-alpine\nport 6379"]
    end

    FE -->|NEXT_PUBLIC_API_URL| BE
    BE -->|DATABASE_URL| PGC
    BE -.->|cache/queue, planned| RC
    BE --- Health{{"pg_isready healthcheck\ngates backend start"}}
    PGC --- Health

    Browser(("User browser")) -->|":3000"| FE
    Browser -->|":8000/api/docs"| BE
```

In production the README documents **Vercel** for the frontend and **Railway** for the backend,
with the same Docker images used for local Compose.

---

## 2. Authentication Flow

The backend implements a classic JWT flow (`backend/api/routers/auth.py` +
`backend/services/auth_service.py`), but **the frontend currently talks to a local mock**
(`frontend/src/services/auth.ts` fakes the network call and fabricates a `User` from
`localStorage`) rather than the real `/api/auth/*` endpoints. The sequence below shows the
backend-side flow as implemented, which is what the frontend needs to be pointed at to go live.

```mermaid
sequenceDiagram
    actor U as User
    participant FE as Next.js (AuthContext)
    participant API as FastAPI /api/auth
    participant SVC as AuthService
    participant DB as PostgreSQL

    U->>FE: Submit email + password (login/register)
    FE->>API: POST /api/auth/login or /register
    API->>SVC: authenticate_user() / create_user()
    SVC->>DB: query users / insert user + preferences
    DB-->>SVC: user row
    SVC->>SVC: verify_password() [bcrypt] /\ncreate_access_token() [JWT, 24h expiry]
    SVC-->>API: User + signed JWT
    API-->>FE: 200 { access_token, token_type, user }
    FE->>FE: store user in localStorage,\nredirect to /onboarding or /dashboard

    Note over FE,API: Subsequent calls
    FE->>API: GET /api/* with "Authorization: Bearer <token>"
    API->>SVC: decode_token()
    SVC-->>API: TokenData(sub=user_id)
    API-->>FE: 200 response, or 401 → ApiClient clears\ntoken and redirects to /login
```

**Google login** follows the same shape but swaps `authenticate_user` for
`authenticate_with_google`, which verifies a Firebase ID token via `firebase_admin` and
upserts a `User` row keyed on `firebase_uid`.

---

## 3. Indoor Navigation Flow

Pathfinding runs **client-side**: the frontend builds a weighted graph of the selected floor
(`navigation/graph.ts`) and solves it with a textbook Dijkstra implementation
(`navigation/dijkstra.ts`), then narrates the path with turn-by-turn audio cues.

```mermaid
sequenceDiagram
    actor U as User
    participant Voice as VoiceContext / UI
    participant NavSvc as navigationService.ts
    participant Graph as graph.ts
    participant Dij as dijkstra.ts
    participant Map as IndoorMap.tsx (Leaflet)
    participant Audio as audioCues.ts (TTS)

    U->>Voice: "Take me to Lab 204" (speech or tap)
    Voice->>NavSvc: parsed destination
    NavSvc->>Graph: build/select graph for building+floor
    NavSvc->>Dij: dijkstra(graph, currentNode, destinationNode)
    Dij-->>NavSvc: { path[], distance }
    NavSvc->>Map: render NavigationPath over IndoorMap
    NavSvc->>Audio: generate step-by-step directions
    Audio-->>U: spoken turn-by-turn guidance + audio cues
```

Building/floor/room *data* (used to seed the graph) is modeled on the backend
(`Building` → `Floor` → `Facility` / `NavigationDestination`), but the navigation API router that
would serve this data to the frontend is not present yet — today `indoorMapData.ts` supplies
static/mock map data to the client.

---

## 4. Emergency SOS Flow

```mermaid
sequenceDiagram
    actor U as User
    participant UI as Emergency Dashboard
    participant Geo as Browser Geolocation API
    participant API as /api/emergency (planned)
    participant DB as PostgreSQL

    U->>UI: Tap SOS button
    UI->>Geo: request current position
    Geo-->>UI: { lat, lng }
    UI->>API: POST /api/emergency/sos { location, type }
    API->>DB: insert EmergencyAlert(status=ACTIVE)
    DB-->>API: alert id
    API-->>UI: 201 Created
    UI-->>U: confirmation + notify emergency contacts
```

`EmergencyContact` and `EmergencyAlert` ORM models exist (`backend/models/emergency.py`); the
`emergency` router that would expose this flow over HTTP is referenced by `main.py` but not yet
implemented.

---

## 5. Data Model (PostgreSQL / SQLAlchemy)

```mermaid
erDiagram
    USERS ||--o| USER_PREFERENCES : has
    USER_PREFERENCES ||--o| NOTIFICATION_PREFERENCES : has
    USERS ||--o{ EMERGENCY_CONTACTS : owns
    USERS ||--o{ EMERGENCY_ALERTS : triggers
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ NAVIGATION_HISTORY : logs

    BUILDINGS ||--o{ FLOORS : contains
    FLOORS ||--o{ FACILITIES : contains
    BUILDINGS ||--o{ NAVIGATION_DESTINATIONS : has
    FLOORS ||--o{ NAVIGATION_DESTINATIONS : has
    NAVIGATION_DESTINATIONS ||--o{ NAVIGATION_HISTORY : "navigated to"

    USERS {
        uuid id PK
        string email UK
        string name
        string password_hash
        enum role "user|admin"
        enum accessibility_mode "visually-impaired|low-vision|standard"
        string firebase_uid UK
        bool is_active
    }
    USER_PREFERENCES {
        uuid id PK
        uuid user_id FK
        string theme
        string font_size
        string voice_speed
        bool high_contrast
        bool voice_navigation
        bool text_to_speech
    }
    NOTIFICATION_PREFERENCES {
        uuid id PK
        uuid preferences_id FK
        bool push_enabled
        bool emergency_alerts
    }
    BUILDINGS {
        uuid id PK
        string name
        string code UK
        float latitude
        float longitude
    }
    FLOORS {
        uuid id PK
        uuid building_id FK
        string name
        int level
        json rooms
    }
    FACILITIES {
        uuid id PK
        uuid floor_id FK
        enum type "washroom|elevator|exit|..."
        json coordinates
    }
    NAVIGATION_DESTINATIONS {
        uuid id PK
        string name
        uuid building_id FK
        uuid floor_id FK
        enum type "room|facility|office|lab|..."
    }
    NAVIGATION_HISTORY {
        uuid id PK
        uuid user_id FK
        uuid destination_id FK
        bool completed
        int duration_seconds
    }
    EMERGENCY_CONTACTS {
        uuid id PK
        uuid user_id FK
        string name
        string phone
    }
    EMERGENCY_ALERTS {
        uuid id PK
        uuid user_id FK
        enum type "sos|medical|security|fire"
        enum status "active|resolved"
        json location
    }
    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        enum type "class|event|emergency|navigation|system"
        bool read
    }
```

All primary keys are `UUID` (generated client-side via `uuid.uuid4()`); schema creation is done
via `Base.metadata.create_all()` on startup (`backend/main.py:18`) rather than Alembic
migrations, even though `alembic` is a declared dependency.

---

## 6. Frontend Route Map

```mermaid
flowchart TD
    Root["/ (landing page)"] --> Login["/login"]
    Root --> Register["/register"]
    Login --> Forgot["/forgot-password"]
    Register --> Onboarding["/onboarding\n(choose accessibility mode)"]
    Login -->|"ProtectedRoute"| Dash
    Onboarding --> Dash["/dashboard (layout + sidebar)"]

    subgraph Dash["Dashboard (protected)"]
        DHome["/dashboard"]
        Map["/dashboard/map\n(Leaflet campus map)"]
        Indoor["/dashboard/indoor\n(building → floor → room)"]
        Voice["/dashboard/voice\n(voice assistant)"]
        OCR["/dashboard/ocr\n(image → text → TTS)"]
        Emergency["/dashboard/emergency\n(SOS)"]
        Notif["/dashboard/notifications"]
        Profile["/dashboard/profile"]
        Admin["/dashboard/admin"]
    end
```

`DashboardLayout` wraps all `/dashboard/*` routes with `ProtectedRoute` (redirects unauthenticated
users to `/login`), the sidebar, the `VoiceFloatingButton`, and the accessibility
announcer/skip-link components.

---

## 7. Tech Stack

### Frontend (`frontend/`)
| Concern | Technology |
|---|---|
| Framework | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS, `tailwind-merge`, `clsx` |
| Animation | Framer Motion |
| Server state | TanStack React Query, Axios |
| Forms & validation | React Hook Form, Zod |
| UI primitives | Radix UI (dialog, dropdown, tabs, tooltip, popover, switch, slider), Lucide icons |
| Maps | Leaflet, react-leaflet (OpenStreetMap tiles) |
| Charts | Recharts (admin/dashboard analytics) |
| Auth (client) | Firebase JS SDK (Google sign-in), custom `AuthContext` |
| Voice | Web Speech API (`SpeechRecognition` / `SpeechSynthesis`) via `VoiceContext` |
| Theming | `next-themes` (light/dark/system) |

### Backend (`backend/`)
| Concern | Technology |
|---|---|
| Framework | FastAPI 0.111, Uvicorn (dev) / Gunicorn (prod) |
| ORM / DB driver | SQLAlchemy 2.0, `psycopg2-binary` |
| Migrations (declared, unused) | Alembic |
| Auth | `python-jose` (JWT), `passlib[bcrypt]` (password hashing), `firebase-admin` (Google token verification) |
| Validation | Pydantic 2 / `pydantic-settings` |
| OCR | `pytesseract`, `opencv-python`, `Pillow`, `numpy` |
| Background/async work (declared, unused) | Celery + Redis |
| HTTP client | `httpx` |

### Data & Infrastructure
| Concern | Technology |
|---|---|
| Primary database | PostgreSQL 16 |
| Cache / queue | Redis 7 |
| Containerization | Docker, Docker Compose |
| Frontend hosting | Vercel |
| Backend hosting | Railway |
| API docs | Swagger UI (`/api/docs`), ReDoc (`/api/redoc`) — auto-generated by FastAPI |

---

## 8. Implementation Status

What's actually present in this checkout vs. what the README/`main.py` describe:

| Area | Status |
|---|---|
| FastAPI app shell, CORS, health check | ✅ Implemented (`backend/main.py`) |
| Auth router (`register`, `login`, `google`, `forgot/reset-password`, `me`) | ✅ Implemented (`backend/api/routers/auth.py`) |
| `AuthService` (JWT, bcrypt, Firebase) | ✅ Implemented |
| ORM models (User, Navigation, Emergency, Notification) | ✅ Implemented (`backend/models/`) |
| `users`, `navigation`, `ocr`, `emergency`, `notifications`, `admin`, `voice`, `dashboard` routers | ⚠️ Imported by `main.py` but the modules do not exist in `backend/api/routers/` — **the backend will fail to start until these are added or the imports are removed** |
| Alembic migrations | ⚠️ Dependency declared, no `alembic.ini`/`migrations/` found; schema is created via `create_all()` |
| Celery/Redis task queue | ⚠️ Dependency declared, no Celery app/tasks found |
| Frontend pages for all dashboard features | ✅ Implemented (UI only, see route map above) |
| Frontend ↔ backend auth wiring | ⚠️ `services/auth.ts` is a local mock (`localStorage` + fake delay); not yet calling `/api/auth/*` |
| Frontend navigation data | ⚠️ Uses static `indoorMapData.ts`; not yet fetched from a `navigation` API |

This table is the most useful starting point for prioritizing remaining work: the single
highest-impact fix is implementing (or stubbing) the eight missing routers so `uvicorn main:app`
can boot at all.
