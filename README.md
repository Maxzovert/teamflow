# Tobedone

A real-time team collaboration app built with Next.js, MongoDB, Socket.IO, and NextAuth.

## Features

- **Dashboard** — Task stats, priority breakdown, and activity timeline
- **Projects** — Create projects with task groups and discussion channels
- **Tasks** — Assign tasks, accept/reject assignments, track status
- **Todos** — Personal todo list with completion tracking
- **Notifications** — Real-time notifications via Socket.IO
- **Chat** — Project discussion groups with live messaging

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Setup

1. **Clone and install dependencies**

   ```bash
   cd teamflow
   npm install
   ```

2. **Configure environment variables**

   Copy `.env.example` to `.env.local` and fill in the values:

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Description |
   |----------|-------------|
   | `MONGODB_URI` | MongoDB connection string |
   | `NEXTAUTH_SECRET` | Random secret for NextAuth sessions |
   | `NEXTAUTH_URL` | App URL (e.g. `http://localhost:3000`) |
   | `AUTH_SECRET` | Auth secret (can match `NEXTAUTH_SECRET`) |

3. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

4. **Create an account**

   Visit `/register` to create your first user, then sign in at `/login`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Socket.IO (`tsx server.ts`) |
| `npm run build` | Build Next.js for production |
| `npm run start` | Start production server with Socket.IO |

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** MongoDB + Mongoose
- **Auth:** NextAuth v5
- **Real-time:** Socket.IO
- **UI:** Tailwind CSS, Radix UI, Framer Motion
- **State:** TanStack Query, Zustand

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login & register
│   ├── (dashboard)/     # Protected app pages
│   └── api/             # REST API routes
├── components/          # UI components
├── hooks/               # React Query hooks
├── lib/                 # Utilities, auth, socket
├── models/              # Mongoose schemas
└── stores/              # Zustand stores
```
