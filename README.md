# VisionPath AI

> **Navigate Without Limits** — AI-powered indoor navigation and accessibility platform for everyone.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![WCAG](https://img.shields.io/badge/WCAG-2.2%20AA-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🌟 Overview

VisionPath AI is a production-ready, accessibility-first platform designed to make indoor spaces navigable for:

- **Visually Impaired Users** — Screen reader optimization, voice navigation, TTS
- **Low Vision Users** — Large fonts, dark mode, magnifier ready, high contrast
- **Standard Users** — Full-featured dashboard with accessibility on demand

The platform automatically personalizes the **entire interface** based on the user's selected accessibility profile during onboarding.

---

## 🚀 Tech Stack

### Frontend
- **React 18 + Next.js 14** — App Router, Server Components
- **TypeScript** — Type-safe development
- **Tailwind CSS** — Utility-first styling with dark/light themes
- **Framer Motion** — Premium animations and transitions
- **React Query** — Server state management
- **React Hook Form** — Form handling
- **Leaflet** — OpenStreetMap integration

### Backend
- **FastAPI** — High-performance Python API
- **PostgreSQL** — Primary database
- **SQLAlchemy** — ORM with async support
- **JWT Authentication** — Secure token-based auth
- **Firebase Auth** — Google login support
- **Redis** — Caching and task queues

### Infrastructure
- **Docker** — Containerized deployment
- **Vercel** — Frontend hosting
- **Railway** — Backend hosting
- **Docker Compose** — Local development

---

## 🏗️ Project Structure

```
visionpath-ai/
├── frontend/                    # Next.js Frontend
│   ├── src/
│   │   ├── app/                 # App Router Pages
│   │   │   ├── page.tsx         # Landing Page
│   │   │   ├── login/           # Login Page
│   │   │   ├── register/        # Register Page
│   │   │   ├── forgot-password/ # Forgot Password
│   │   │   ├── onboarding/      # Accessibility Onboarding
│   │   │   └── dashboard/       # Dashboard & Features
│   │   │       ├── page.tsx     # Main Dashboard
│   │   │       ├── map/         # Campus Map
│   │   │       ├── indoor/      # Indoor Navigation
│   │   │       ├── voice/       # Voice Assistant
│   │   │       ├── ocr/         # OCR Reader
│   │   │       ├── emergency/   # Emergency SOS
│   │   │       ├── notifications/
│   │   │       ├── profile/     # User Profile
│   │   │       └── admin/       # Admin Panel
│   │   ├── components/          # Reusable components
│   │   ├── contexts/            # React Contexts
│   │   │   ├── AuthContext
│   │   │   ├── AccessibilityContext
│   │   │   └── VoiceContext
│   │   ├── services/            # API services
│   │   ├── types/               # TypeScript types
│   │   └── lib/                 # Utilities
│   └── Dockerfile
│
├── backend/                     # FastAPI Backend
│   ├── main.py                  # Application entry
│   ├── api/
│   │   └── routers/             # API routes
│   ├── models/                  # SQLAlchemy models
│   ├── services/                # Business logic
│   ├── database/                # DB configuration
│   └── Dockerfile
│
├── docker-compose.yml           # Full stack deployment
└── README.md
```

---

## ✨ Features

### 🔐 Authentication
- Email/Password login & registration
- Google OAuth login
- Password reset flow
- JWT-based sessions
- Protected routes

### ♿ Accessibility Modes
- **Visually Impaired**: Screen reader, voice nav, TTS, voice commands, large touch targets, high contrast, audio feedback
- **Low Vision**: Large fonts, dark mode, magnifier, high contrast, voice assistant
- **Standard**: Full modern dashboard with on-demand accessibility

### 🗺️ Navigation
- **Campus Map**: Leaflet-based with building markers
- **Indoor Navigation**: Building → Floor → Room selection
- **Voice Navigation**: "Take me to Lab 204"
- **Facility Finder**: Washrooms, elevators, exits, medical
- **Future Ready**: Google Indoor Maps, BLE, QR, NFC

### 🎤 Voice Assistant
- Web Speech API & Speech Recognition
- Natural language commands
- Continuous listening mode
- Text-to-speech responses
- Command examples: navigate, read, call, open, search

### 📷 OCR Reader
- Upload or capture images
- Text extraction
- Read aloud with TTS
- Copy & translate
- Multi-language support

### 🆘 Emergency SOS
- Large SOS button with haptic feedback
- Live location sharing
- Emergency contacts
- Quick access to security & medical
- Emergency point finder

### 👤 Profile & Settings
- Accessibility mode switching
- Theme: Light/Dark/System
- Font size: Normal/Large/X-Large
- Language selection
- Voice speed control
- Notification preferences
- Toggle: High contrast, Reduced motion, Voice navigation, etc.

### 🔔 Notifications
- Class reminders
- Event alerts
- Emergency notifications
- Navigation suggestions
- Read/unread management

### 🔧 Admin Panel
- User management
- Building management
- Floor plan uploads
- Emergency notifications
- Platform analytics
- Recent activity log

---

## 🚦 Getting Started

### Prerequisites

- Node.js 20+ 
- Python 3.12+
- PostgreSQL 16+
- Docker (optional)

### Quick Start (Local Development)

#### 1. Clone and install frontend dependencies

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000)

#### 2. Set up the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Configure your `.env` file:
```env
DATABASE_URL=postgresql://visionpath:visionpath123@localhost:5432/visionpath_db
SECRET_KEY=your-secret-key-here
```

Run the backend:
```bash
uvicorn main:app --reload --port 8000
```

#### 3. Docker Deployment (Full Stack)

```bash
docker-compose up --build
```

This starts:
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8000](http://localhost:8000)
- API Docs: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

---

## 📱 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@visionpath.ai | admin123 |
| User | (create your own) | - |

---

## 🧪 Key Architecture Decisions

### Accessibility First
The entire UI adapts based on the user's `accessibilityMode` stored in context. CSS classes are toggled globally, font sizes change, contrast increases, and voice features auto-enable.

### Voice as First-Class Citizen
The `VoiceContext` wraps the entire app, providing:
- Speech recognition (Web Speech API)
- Text-to-speech synthesis
- Command parsing with regex patterns
- Event-based integration (`navigate`, `read-aloud`, `emergency-sos` events)

### Map Abstraction
Uses Leaflet/OpenStreetMap now but the architecture supports swapping to Google Maps by changing the `TileLayer` source and marker implementations.

### WCAG 2.2 AA Compliance
- Semantic HTML with ARIA labels
- Keyboard navigation
- Screen reader optimized
- Color contrast ratios > 4.5:1
- Reduced motion support
- Focus visible indicators

---

## 📄 API Documentation

When running, visit:
- Swagger UI: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`

### Core Endpoints

```
POST   /api/auth/register        # Register new user
POST   /api/auth/login           # Login
POST   /api/auth/google          # Google login
GET    /api/auth/me              # Current user

GET    /api/navigation/buildings # List buildings
GET    /api/navigation/destinations # List destinations

POST   /api/emergency/sos        # Trigger SOS
POST   /api/emergency/contacts   # Add emergency contact

GET    /api/notifications        # Get notifications
POST   /api/notifications/read   # Mark as read

GET    /api/dashboard/stats      # Dashboard stats
```

---

## 🚢 Deployment

### Vercel (Frontend)
```bash
cd frontend
npx vercel --prod
```

### Railway (Backend)
Connect your GitHub repo to Railway, set environment variables, and deploy.

### Docker
```bash
docker-compose -f docker-compose.yml up -d
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- OpenStreetMap contributors
- Web Speech API
- Firebase Auth
- All accessibility advocates and users

---

**Built with ❤️ for an inclusive world.**

