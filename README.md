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
   | `NEXTAUTH_URL` / `AUTH_URL` | App URL (local: `http://localhost:3000`; production: `https://your-domain.vercel.app`) |
   | `AUTH_SECRET` | Auth secret (can match `NEXTAUTH_SECRET`) |

3. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

4. **Create an account**

   Visit `/register` to create your first user, then sign in at `/login`.

## Deploying to Vercel

The error *“Unsafe attempt to load URL http://localhost:3000/login from frame…”* on your real site means **Auth still thinks the app URL is localhost**. In the Vercel project → **Settings → Environment Variables**, set:

| Variable | Value |
|----------|--------|
| `AUTH_URL` | `https://teamflow-seven-rust.vercel.app` (your real URL, `https`, no trailing slash) |
| `NEXTAUTH_URL` | Same as `AUTH_URL` (optional if you only use `AUTH_URL`) |
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | Same strong secret as local (or a new one) |
| `MONGODB_URI` | MongoDB Atlas URI (allow `0.0.0.0/0` or Vercel IPs) |

Remove or override any **`NEXTAUTH_URL=http://localhost:3000`** pulled from a copied `.env`. Redeploy after saving.

**Note:** This repo’s `npm run start` uses a **custom Node server** (`server.ts`) for Socket.IO. Default Vercel runs `next start` without that server, so real-time sockets may need a separate host or a different deployment target. Auth and normal pages work once env URLs are correct.

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
