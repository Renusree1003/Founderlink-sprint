# FounderLink Frontend (React)

This frontend is built with React + Vite and connects to the API Gateway.

## Prerequisites

- Node.js 20+
- npm 10+

## Run locally (without Docker)

1. Copy env file:

   `Copy-Item .env.example .env`

2. Install deps:

   `npm install`

3. Start dev server:

   `npm run dev`

Frontend runs on `http://localhost:5173` and calls gateway `http://localhost:8080` by default.

## Run with Docker Compose

From repository root:

`docker compose up --build`

Frontend will be available at `http://localhost:3000`.
