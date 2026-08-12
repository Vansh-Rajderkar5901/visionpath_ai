# VisionPath AI

> **Navigate Without Limits** — an accessibility-first indoor navigation web application.

![WCAG](https://img.shields.io/badge/WCAG-2.2%20AA-brightgreen)
![Database](https://img.shields.io/badge/database-PostgreSQL-336791)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Overview

VisionPath AI helps people find their way around indoor campus spaces. The whole
interface adapts to an accessibility profile chosen during onboarding:

- **Visually impaired** — screen-reader optimisation, spoken turn-by-turn guidance, voice commands, extra-large targets, high contrast
- **Low vision** — large fonts, dark theme, high contrast, magnifier-ready layout
- **Standard** — the full dashboard, with accessibility available on demand

It is a **web application** — a Next.js frontend talking to a FastAPI backend over
HTTP, with **PostgreSQL** as the only datastore. There is no Docker setup, no
Firebase, and no mobile build.

---

## Architecture

```
┌──────────────────────────┐        HTTP/JSON        ┌──────────────────────────┐
│  Next.js 14 (App Router) │ ──────────────────────► │  FastAPI                 │
│  React 18 + TypeScript   │  Bearer JWT             │  SQLAlchemy 2            │
│  Tailwind, React Query   │ ◄────────────────────── │  Dijkstra route engine   │
└──────────────────────────┘                         └───────────┬──────────────┘
        localhost:3000                                           │
                                                                 ▼
                                                     ┌──────────────────────────┐
                                                     │  PostgreSQL              │
                                                     │  users, prefs, nav graph │
                                                     └──────────────────────────┘
```

**One source of truth.** Buildings, floors, rooms, the routing graph, and the
spoken directions all live in PostgreSQL. The frontend holds no campus data — it
asks the API. Routing (Dijkstra over the `node`/`edge` tables) runs on the
server, so the browser and the API can never disagree about a route.

```
visionpath-ai/
├── frontend/                  # Next.js web app
│   └── src/
│       ├── app/               # Routes (landing, auth, onboarding, dashboard/*)
│       ├── components/        # UI, map, accessibility, voice components
│       ├── contexts/          # Auth, Accessibility, Voice providers
│       ├── services/          # One typed module per API area
│       ├── lib/               # Helpers + typed voice event bus
│       └── types/             # Shared types mirroring the API responses
│
├── backend/                   # FastAPI service
│   ├── main.py                # App entry, routers, health check
│   ├── core/                  # Settings + password/JWT primitives
│   ├── database/              # Engine, session, declarative base
│   ├── models/                # SQLAlchemy tables
│   ├── schemas/               # Pydantic request models
│   ├── services/              # Auth, routing, OCR, voice intent parsing
│   ├── api/routers/           # One router per feature area
│   └── seed.py                # Creates tables + loads the CSE Block campus
│
├── setup-database.bat         # Create tables and seed
├── start-backend.bat          # Run the API
└── start-frontend.bat         # Run the web app
```

---

## Getting started

### Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| PostgreSQL | 14+ | The only supported database |
| Python | 3.11+ | Backend |
| Node.js | 20+ | Frontend |
| Tesseract OCR | any | **Optional** — only for the OCR reader |

### 1. Create the database

Using `psql` (or pgAdmin):

```sql
CREATE DATABASE visionpath_db;
```

### 2. Configure the backend

```bash
cd backend
copy .env.example .env      # macOS/Linux: cp .env.example .env
```

Edit `backend/.env` and set at minimum:

```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/visionpath_db
```

If your password contains special characters, percent-encode them
(`@` becomes `%40`, `#` becomes `%23`).

Generate a signing key for anything other than local development:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

and put it in `SECRET_KEY`.

### 3. Create the tables and load the campus data

**Windows:** double-click `setup-database.bat`

**Any platform:**

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
python seed.py
```

This creates every table and loads the CSE Block second floor: 24 graph nodes,
23 walkable edges, spoken directions in both directions, 16 destinations, a
sample timetable, and an administrator account.

Use `python seed.py --reset` to drop everything and start over.

### 4. Run it

Two terminals (or the two `.bat` files):

```bash
# Terminal 1 — API on http://localhost:8000
cd backend
venv\Scripts\activate
uvicorn main:app --reload --port 8000

# Terminal 2 — web app on http://localhost:3000
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**. Interactive API docs are at
**http://localhost:8000/api/docs**.

### Default administrator

Created by the seed from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`:

| Email | Password |
|---|---|
| `admin@visionpath.ai` | `Admin@1234` |

Change these in `backend/.env` before seeding a real deployment.

---

## Features

### Authentication
Email and password registration with a strength policy, bcrypt hashing, and JWT
bearer sessions. Passwords and reset tokens are always sent in the request body,
never the query string. Suspended accounts are refused at the API.

### Accessibility
The backend owns the preset for each accessibility mode, so the interface and
the stored profile cannot drift apart. Preferences persist per user: theme, font
size, contrast, reduced motion, touch-target size, speech rate, voice selection,
language. A floating panel offers speech controls from any page.

### Indoor navigation
Pick where you are, pick where you're going, get a route. The server runs
Dijkstra over the campus graph and returns the path, the distance, a walking-time
estimate, and step-by-step instructions with turn directions. Instructions are
authored per traversal in both directions; anything unauthored falls back to a
generated line rather than leaving a gap. Unreachable or unknown destinations
return a clear error instead of an infinite distance.

### Voice assistant
Speech recognition in the browser, intent parsing on the server. Say
*"take me to BS-17A"* and — if your current location is set — the reply already
contains the full route, which the indoor page picks up through a typed event
bus. Every command is also typeable, so the assistant works without a
microphone. Supported intents: navigate, search, read, call, open, emergency,
help, cancel.

### OCR reader
Upload or capture an image; the server extracts the text with Tesseract and the
app reads it aloud. If Tesseract is not installed, the UI says so plainly up
front instead of failing at upload time.

### Emergency SOS
One button raises an alert, attaches your coordinates when the browser allows
it, and notifies every administrator. Emergency contacts are per user, with the
campus security and medical numbers added automatically at registration.

### Admin panel
Live platform statistics, user management (role and suspension), active
emergency alerts, campus-wide notification broadcast, and a merged activity feed
built from real events.

---

## API

Full interactive documentation: `http://localhost:8000/api/docs`

```
POST   /api/auth/register              Create an account
POST   /api/auth/login                 Sign in
GET    /api/auth/me                    Current user
POST   /api/auth/forgot-password       Begin a password reset
POST   /api/auth/reset-password        Complete a password reset
POST   /api/auth/change-password       Change while signed in

GET    /api/users/me                   Profile + preferences
PATCH  /api/users/me                   Update name, email, phone
PUT    /api/users/me/mode              Switch accessibility mode
PUT    /api/users/me/preferences       Patch individual preferences

GET    /api/navigation/buildings       Buildings with floors, rooms, facilities
GET    /api/navigation/destinations    Searchable destinations
GET    /api/navigation/facilities      Facilities, filterable by type
GET    /api/navigation/nodes           Every routable point
GET    /api/navigation/graph           Raw adjacency map
POST   /api/navigation/route           Shortest path + instructions
GET    /api/navigation/history         This user's journeys

POST   /api/voice/command              Parse and act on an utterance
GET    /api/voice/commands             Supported phrasings

POST   /api/ocr/extract                Image -> text
GET    /api/ocr/status                 Is the OCR engine available

GET    /api/emergency/contacts         List / add / update / delete
POST   /api/emergency/sos              Raise an alert
POST   /api/emergency/alerts/{id}/resolve

GET    /api/notifications              Inbox + unread count
POST   /api/notifications/read-all     Mark everything read

GET    /api/dashboard/stats            Personal statistics
GET    /api/dashboard/upcoming-classes Timetable
GET    /api/dashboard/recent-locations Most-visited destinations

GET    /api/admin/stats                Platform statistics       (admin)
GET    /api/admin/users                User list                 (admin)
PATCH  /api/admin/users/{id}           Change role or status     (admin)
POST   /api/admin/notifications        Broadcast                 (admin)
GET    /api/admin/activity             Recent platform events    (admin)
```

---

## Extending the campus map

The campus lives in `backend/seed.py`. To add a floor or a building, extend
`NODES`, `EDGES`, `DIRECTIONS`, and `LOCATIONS` there and re-run `python seed.py` —
it inserts what is missing and leaves existing rows alone. Every `LOCATIONS`
entry names the graph node it sits on, which is what links a room a user asks
for to a point the router can reach.

---

## Security notes

- No credentials are committed. `backend/.env` is git-ignored; `backend/.env.example` documents every setting.
- `SECRET_KEY` is required whenever `ENVIRONMENT` is not `development`.
- Roles are enforced server-side. Editing browser storage cannot grant admin access — the session is re-validated against `/api/auth/me` on every load.
- `/api/auth/forgot-password` answers identically whether or not the account exists. There is no mail provider wired up, so in development only, the reset token is returned in the response to make the flow completable; hook up an email service before deploying.

---

## Deployment

Any host that runs a Node process and a Python process against a PostgreSQL
instance will work.

- **Frontend** — `npm run build && npm start`, with `NEXT_PUBLIC_API_URL` pointing at the deployed API.
- **Backend** — `uvicorn main:app --host 0.0.0.0 --port 8000` (or gunicorn with uvicorn workers), with `ENVIRONMENT=production`, a real `SECRET_KEY`, and `CORS_ORIGINS` set to the frontend's origin.

---

## License

MIT — see [LICENSE](LICENSE).

---

**Built for an inclusive world.**
