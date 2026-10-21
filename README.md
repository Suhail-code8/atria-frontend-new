# Atria Frontend

Atria is an event platform for participants, organizers, and judges. This repository contains the React and TypeScript single-page application; the API lives in [atria-backend](https://github.com/Suhail-code8/atria-backend).

## What the frontend supports

- Public event discovery and event detail pages
- Account registration and sign-in
- Role-aware participant, organizer, and judge dashboards
- Organizer tools for event setup, participants, announcements, competitions, review, scoring, and results
- API requests and real-time updates through the backend

The interface uses React, TypeScript, Vite, React Router, Tailwind CSS, Axios, and Socket.IO Client.

## Run locally

### Requirements

- Node.js compatible with the Vite version in this project
- npm
- The Atria backend running locally on port 5000, with MongoDB and its required service configuration

### Install and start

```bash
npm install
npm run dev
```

Vite serves the frontend at [http://localhost:3000](http://localhost:3000). The development server forwards requests under `/api` to `http://localhost:5000`; start the backend separately for authenticated and live data features.

## Available scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the local Vite development server |
| `npm run build` | Run TypeScript project checks and create a production build |
| `npm run preview` | Preview the generated build locally |
| `npm run lint` | Run ESLint |

## Project map

- `src/pages` — public pages and role-specific screens
- `src/layout` — shared application and event navigation
- `src/components` — reusable UI and feature components
- `src/api` — API clients
- `src/auth` — authentication state and route guards
- `src/types` — shared frontend data types

## Deployment notes

The frontend expects the API at the same origin under `/api`. The production web server must serve the built frontend and route `/api` requests to the backend. Keep secrets on the backend; do not place private credentials in frontend environment variables.

## Project status

Atria is a learning project and an in-progress event-platform concept. Features and integrations depend on the backend and deployment configuration. Do not present demo data or local setup as evidence of production usage.
