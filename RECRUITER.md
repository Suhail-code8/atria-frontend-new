# 🎯 Atria — Full-Stack Event & Competition Management Platform

> A production-grade platform built to manage the entire lifecycle of college fests, conferences, and competitions — from event creation to real-time leaderboards.

---

## 🌐 Live Deployment

| Layer | URL |
|-------|-----|
| **Frontend** | https://atria-frontend-new.vercel.app |
| **Backend API** | https://13.48.71.51.nip.io (AWS EC2 — eu-north-1) |
| **Health Check** | https://13.48.71.51.nip.io/api/health |

---

## 🧠 What Is Atria?

Atria is a **multi-role event management system** purpose-built for college fests and competitive events. Think of it as a self-serve platform where:

- **Organizers** can spin up an entire event — with registration flows, competitions, judging panels, team management, and a live leaderboard — all from a visual dashboard.
- **Participants** can discover events, register (free or paid), form teams, submit work, and track their scores.
- **Judges** get a dedicated console to score individual and team entries per competition item.

The platform is powered by a **custom workflow engine** that lets organizers design participant onboarding flows using a drag-and-drop node graph — replacing rigid event pipelines with a composable, configurable system.

---

## 🛠️ Tech Stack

### Backend — `Atria-Backend`

| Concern | Technology |
|---------|------------|
| Runtime | Node.js + TypeScript |
| Framework | Express.js v5 |
| Database | MongoDB (via Mongoose ODM) |
| Auth | JWT (Access + Refresh Token rotation) + Google OAuth 2.0 |
| Real-time | Socket.IO v4 |
| Payments | Razorpay Integration |
| File Storage | Cloudinary (poster uploads) |
| Email | Nodemailer |
| Password Security | bcrypt |
| Deployment | AWS EC2 (Linux) |

### Frontend — `fontend-new`

| Concern | Technology |
|---------|------------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Routing | React Router v7 |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod validation |
| State | React Context API |
| Real-time | Socket.IO Client |
| Workflow UI | ReactFlow (drag-and-drop node graph) |
| Icons | Lucide React |
| Deployment | Vercel (Docker + Nginx for prod) |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    React Frontend                    │
│  Vite + React 19 + TailwindCSS + Framer Motion      │
│  Deployed on: Vercel                                 │
└────────────────────┬────────────────────────────────┘
                     │  HTTPS REST API + WebSocket
┌────────────────────▼────────────────────────────────┐
│              Express.js REST API                     │
│  TypeScript + JWT Auth + Role Middleware             │
│  Deployed on: AWS EC2 (eu-north-1)                  │
└────────────────────┬────────────────────────────────┘
                     │  Mongoose ODM
┌────────────────────▼────────────────────────────────┐
│                   MongoDB Atlas                      │
│  Collections: Users, Events, Participations,         │
│  Teams, CompetitionItems, Entries, Results,          │
│  Notifications, Announcements                        │
└─────────────────────────────────────────────────────┘
```

---

## 👥 Role System

The platform uses a **3-tier RBAC system** enforced at both the API middleware layer and the React route layer:

| Role | What They Can Do |
|------|-----------------|
| **ORGANIZER** | Create & manage events, configure workflow, manage teams, assign judges, publish leaderboards, generate AI posters |
| **PARTICIPANT** | Browse events, register, join teams, submit entries, view scores & personal leaderboard |
| **JUDGE** | Access assigned events only, score individual/group competition entries with place & grade |

Route protection is double-layered — JWT `authMiddleware` + `roleMiddleware` on the server, and `ProtectedRoute` + `JudgeProtectedRoute` guards on the client.

---

## ✨ Key Features

### 🔧 Visual Workflow Engine
The most unique feature of Atria. Organizers design participant onboarding journeys using a **ReactFlow drag-and-drop canvas**. Available nodes:

- **REGISTRATION** → Collects participant info via dynamic forms
- **PAYMENT** → Locks a seat with a 10-minute hold, processes via Razorpay
- **TEAM_FORMATION** → Groups participants into named teams
- **SUBMISSION** → Accepts project/media file uploads
- **COMPETITION_OPT_IN** → Registers team/individual for specific events
- **JUDGING_ROUND** → Links to judge scoring
- **LEADERBOARD** → Publishes real-time rankings

Each participant's progress through this workflow is tracked per node with timestamps.

---

### 🔐 Authentication
- **Email/Password** with bcrypt-hashed passwords
- **Google OAuth 2.0** via `@react-oauth/google` + `google-auth-library`
- **JWT refresh token rotation** — access tokens (short-lived) + httpOnly refresh cookies (7 days)
- Auto-registers Google users on first sign-in

---

### 🏆 Competition & Scoring Engine
- Organizers define **Competition Categories** with **Items** (individual or team-based)
- Configurable scoring rules: **place points** (1st/2nd/3rd) and **grade points** (A/B/C)
- Judges are assigned to specific competition items
- Each entry can be scored by place (numeric rank) or grade
- Points are aggregated into an **individual leaderboard** per participant

---

### 🎨 AI Poster Generator
Organizers can generate professional event promotional posters in 5 visual styles:
- **Vanguard** — Bold brutalist
- **Aurora** — Ethereal gradients
- **Cyber** — Neon futurist
- **Luxe** — Marble & gold luxury
- **Midnight** — Dark cinematic noir

Posters are generated via an AI image API, stored on Cloudinary, and displayed in a gallery with download/share options.

---

### ⚡ Real-Time Notifications & Leaderboards
- **Socket.IO** rooms per user and per event leaderboard
- Notifications pushed server-side when events are approved/rejected or scores published
- Live leaderboard updates streamed to all subscribed participants

---

### 🧾 Event Lifecycle State Machine
Events move through a strictly validated state machine:

```
DRAFT → PUBLISHED → REGISTRATION_OPEN → ONGOING → COMPLETED → ARCHIVED
             ↓                ↓              ↓
          CANCELLED        CANCELLED      CANCELLED → ARCHIVED
```

Each transition validates preconditions (e.g., can't open registration without registration dates set; can't mark ongoing before start date).

---

### 💳 Paid Event Registration with Smart Seat Locking
- Events can be free or paid
- On checkout initiation, a **10-minute seat lock** is placed (`lockedUntil` field)
- Razorpay order is created and verified server-side
- Prevents double-booking race conditions

---

## 📡 API Overview

The backend exposes a structured REST API under `/api/`:

| Prefix | Module |
|--------|--------|
| `/api/auth` | Register, login, Google OAuth, refresh, logout |
| `/api/users` | User profile management |
| `/api/events` | CRUD, lifecycle transitions, workflow, analytics, poster generation |
| `/api/participation` | Register/withdraw from events, workflow advancement |
| `/api/teams` | Create/join teams, add members by email |
| `/api/competition-items` | Competition item setup (individual/group) |
| `/api/categories` | Competition category management |
| `/api/entries` | Competition entries per team/participant |
| `/api/results` | Score submission and leaderboard queries |
| `/api/event-judges` | Assign/query judges for competition items |
| `/api/announcements` | Post & fetch event announcements |
| `/api/notifications` | Fetch, mark-read, real-time push |

---

## 🗂️ Project Structure

### Backend
```
src/
├── app.ts               # Express app with CORS & all route mounts
├── server.ts            # HTTP server, Socket.IO init, DB connection
├── config/              # DB, env config
├── middlewares/         # auth, role, error middleware
├── modules/
│   ├── auth/            # JWT + Google OAuth auth
│   ├── users/           # User model & management
│   ├── events/          # Core event logic + lifecycle + workflow
│   ├── participation/   # Registration + workflow progression
│   ├── competitions/    # Categories, items, teams, entries, results
│   ├── submissions/     # File submission handling
│   ├── notifications/   # Real-time push + REST
│   └── announcements/   # Event announcements
├── types/               # Shared TypeScript types
└── utils/               # Email service, Socket.IO singleton
```

### Frontend
```
src/
├── App.tsx              # Route config with role guards
├── api/                 # Axios API clients (events, competition, judge, etc.)
├── auth/                # AuthContext + Google OAuth
├── components/          # Reusable UI: Button, Card, Badge, Input, etc.
│   ├── events/          # EventCard, PosterEngine, etc.
│   ├── workflow/        # ReactFlow custom nodes, config panels
│   └── ui/              # Design system primitives
├── pages/
│   ├── Home.tsx         # Event discovery landing page
│   ├── Login.tsx        # Auth + Google sign-in
│   ├── Register.tsx     # Registration with role selection
│   ├── dashboards/      # MyRegistrations, MyEvents, JudgeAssignments
│   └── events/
│       ├── EventHub.tsx          # Public event page
│       ├── ParticipantDashboard  # Participant's live event view
│       ├── JudgeEventConsole     # Judge scoring interface
│       └── manage/               # 14 organizer management pages
├── layout/              # AppLayout, EventLayout with sidebar
└── context/             # EventContext for shared event state
```

---

## 🧪 How to Test the App (Step-by-Step)

> **Frontend is live at:** https://atria-frontend-new.vercel.app

### 👤 Test as a Participant

1. Go to **https://atria-frontend-new.vercel.app**
2. Click **Register** → create an account with role **Participant**
   *(or use Google Sign-In for instant access)*
3. Browse the event cards on the homepage
4. Click any event → view the **Event Hub** page (dates, description, status)
5. Click **Register for Event** to enroll
6. Go to **My Registrations** (top nav, after login) to see your enrolled events
7. Click an event you're registered for → enter the **Participant Dashboard** to see your competition entries, team info, and scores

---

### 🎪 Test as an Organizer

1. Register with role **Organizer** (or use a separate Google account)
2. Go to **My Events** dashboard → click **Create Event**
3. Fill in event details (title, dates, type, description)
4. After creation, you'll see the **Event Management Sidebar** with:
   - **Settings** — Edit event details, open/close registration
   - **Workflow Builder** — Drag REGISTRATION → PAYMENT → TEAM_FORMATION nodes onto the canvas and connect them
   - **Competitions** — Add categories and individual/group competition items with scoring rules
   - **Participants** — View all registrations, approve/reject
   - **Teams** — View and manage formed teams
   - **Judges** — Add users as judges and assign them to competition items
   - **Scoring** — Submit scores manually
   - **Leaderboard** — View and publish rankings
   - **Announcements** — Post updates to participants
   - **Promotion** — Generate AI-styled event posters

5. Use the **Lifecycle transition** buttons to move event state:
   `DRAFT → PUBLISHED → REGISTRATION_OPEN → ONGOING → COMPLETED`

---

### ⚖️ Test as a Judge

1. Register with role **Participant** first — judges are promoted by Organizers
2. Ask an Organizer to add your account as a judge and assign you to a competition item
3. Log in → go to **My Assignments** dashboard
4. Click an event assignment → enter the **Judge Console**
5. See all entries for your assigned competition item
6. Award a **Place** (1st, 2nd, 3rd) or **Grade** (A, B, C) to each entry

---

### 🔌 Test the API Directly

The backend is live. Use Postman, curl, or Insomnia:

```bash
# Health check
GET https://13.48.71.51.nip.io/api/health

# Register a user
POST https://13.48.71.51.nip.io/api/auth/register
Content-Type: application/json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "role": "ORGANIZER"
}

# Login
POST https://13.48.71.51.nip.io/api/auth/login
Content-Type: application/json
{
  "email": "test@example.com",
  "password": "password123"
}
# Response: { data: { accessToken: "...", user: { ... } } }

# List all public events
GET https://13.48.71.51.nip.io/api/events?status=PUBLISHED
```

For authenticated routes, add:
```
Authorization: Bearer <accessToken>
```

---

## 🔑 Engineering Highlights

| Feature | Implementation Detail |
|---------|----------------------|
| **Refresh Token Rotation** | httpOnly cookie, 7-day sliding window, invalidated on logout |
| **Workflow Engine** | Per-participant node progression tracked in DB with full history |
| **Seat Lock** | `lockedUntil` TTL on Participation document prevents double booking |
| **State Machine** | Explicit adjacency list validates every event lifecycle transition |
| **Real-time** | Socket.IO rooms keyed by `userId` and `event:<id>:leaderboard` |
| **AI Poster** | 5 templated styles with dynamic prompt injection from event data |
| **Google OAuth** | Server-side token verification via `google-auth-library`, auto-provisions new users |
| **CORS Policy** | Allowlist-based origin validation — no wildcard in production |
| **Docker** | Multi-stage build (Node builder → Nginx Alpine), custom `nginx.conf` for SPA routing |
| **CI/CD** | GitHub Actions workflows, deployed to Vercel (frontend) and EC2 (backend) |

---

## 📦 Running Locally

### Backend
```bash
cd Atria-Backend
npm install

# Create .env:
# MONGO_URI=...
# JWT_SECRET=...
# JWT_REFRESH_SECRET=...
# GOOGLE_CLIENT_ID=...
# CLOUDINARY_CLOUD_NAME=...
# CLOUDINARY_API_KEY=...
# CLOUDINARY_API_SECRET=...
# RAZORPAY_KEY_ID=...
# RAZORPAY_KEY_SECRET=...
# PORT=5000
# CLIENT_URL=http://localhost:5173

npm run dev
# Starts on http://localhost:5000
```

### Frontend
```bash
cd fontend-new
npm install

# Create .env:
# VITE_API_BASE_URL=http://localhost:5000
# VITE_GOOGLE_CLIENT_ID=...
# VITE_RAZORPAY_KEY_ID=...

npm run dev
# Starts on http://localhost:5173
```

---

## 🙌 What This Project Demonstrates

- ✅ Clean modular backend architecture (controller → service → model)
- ✅ Advanced auth with JWT rotation + OAuth
- ✅ Real-time capabilities via WebSockets
- ✅ Complex domain modeling (competitions, teams, workflow nodes, results)
- ✅ Payment gateway integration with concurrency-safe seat locking
- ✅ Drag-and-drop visual workflow builder (ReactFlow)
- ✅ AI-powered feature (poster generation with 5 design styles)
- ✅ Containerized with Docker, deployed on AWS EC2 + Vercel
- ✅ Role-based access control enforced end-to-end

---

*Feel free to reach out for a walkthrough or code discussion.*
