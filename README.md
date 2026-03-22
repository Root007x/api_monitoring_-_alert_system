# API Monitor — Operations Hub

Full-stack monorepo: Next.js 15 dashboard + Node.js Express API.

## Setup

```bash
npm install && npm run dev
```

> This installs root dependencies and starts both services simultaneously:
> - **Frontend** (Next.js) → http://localhost:3001 (or 3000)
> - **Backend** (Express) → http://localhost:3000

---

## Pages

| Route | Description |
|---|---|
| `/dashboard` | Live alerts table (polls every 30s), summary cards, resolve actions |
| `/trigger` | Submit JSON API entries to the monitor webhook |

## API Endpoints Used

| Method | URL | Description |
|---|---|---|
| `GET` | `http://localhost:5678/webhook/alerts` | Fetch active alerts |
| `PATCH` | `http://localhost:3000/internal/alerts/:id/resolve` | Resolve an alert |
| `POST` | `http://localhost:5678/webhook/monitor` | Submit monitor job |

## Project Structure

```
├── frontend/          # Next.js 15 app (App Router, React 19)
│   └── src/
│       ├── app/       # Pages (dashboard, trigger)
│       ├── components/ # Sidebar, SeverityBadge, Providers
│       ├── lib/       # API client, date utils, QueryClient
│       └── types/     # TypeScript types
├── backend/           # Express API server
│   └── src/app.js
├── package.json       # Root — runs both with concurrently
└── README.md
```

## Tech Stack

- **Next.js 15** + React 19 + TypeScript
- **TailwindCSS v4** + shadcn/ui
- **TanStack Query v5** — data fetching, mutations, polling
- **lucide-react** — icons
- **date-fns** — timestamps
- **Express** + CORS — backend API
- **concurrently** — run both services with one command
