# CareFlow

## Healthcare Appointment & Follow-up Platform

CareFlow is a modern, production-grade healthcare appointment management system designed with concurrency safety, reliability, and modern UI principles. It handles patients, doctors, scheduling, and uses AI to summarize symptoms before visits and clinical notes after visits.

### Live Demo
_To be hosted on Vercel (frontend) and Render (backend)._

### Key Engineering Features
- **Double-Booking Prevention:** A strict database constraint (`doctorId` + `startTime`) and explicit transactional boundaries guarantee that concurrent booking attempts fail gracefully, preventing double bookings under high load.
- **Reliable Asynchronous Operations:** Integrations (Emails via Resend, AI summaries via Gemini, Calendar sync) use the Transactional Outbox pattern processed by BullMQ. If an email fails, the appointment remains intact, and the job retries automatically.
- **Doctor Leave Handling:** If an admin marks a doctor on leave, the system intelligently finds affected future appointments, marks them for rescheduling, and queues notifications.
- **AI Integration:** Uses structured outputs from the Gemini API to turn raw patient symptoms into a structured triage summary, and clinical notes into patient-friendly follow-ups.

## Architecture

```
Browser
  │
  ▼ (Next.js App Router / React)
Web Frontend
  │
  ▼ (HTTPS REST)
NestJS API
  │
  ├──► PostgreSQL (Prisma ORM)
  │      (Holds unique constraints & outbox events)
  │
  └──► Redis (BullMQ)
         │
         ├──► Email Worker (Resend)
         ├──► Calendar Worker (Google API)
         └──► LLM Worker (Gemini)
```

## Double-Booking Prevention & Slot Holds

CareFlow implements a canonical slot approach:
1. When a patient selects a slot, the system attempts to insert an `Appointment` row with `status = 'HELD'`.
2. The database enforces a `@@unique([doctorId, startTime])` constraint.
3. If two patients attempt to book the same slot at the exact same millisecond, the database throws a Unique Constraint Violation (Prisma `P2002`). The application catches this and returns a `409 Conflict`.
4. Only after the hold is successful does the application proceed to collect symptom data and transition the status to `CONFIRMED`.

## Reliable Notifications (Outbox Pattern)

Sending an email during the HTTP request is an anti-pattern. If the email API times out, the user doesn't know if their appointment was booked. 
CareFlow uses a Transactional Outbox:
1. In the same database transaction that confirms the appointment, an `OutboxEvent` row is created.
2. The transaction commits atomically.
3. A BullMQ worker picks up the `OutboxEvent` and processes the email/AI task. If it fails, the job is retried with exponential backoff.

## Local Setup

### Environment Variables
Copy `.env.example` to `.env` and fill in the values:
- `DATABASE_URL` (PostgreSQL)
- `REDIS_URL` (Redis instance)
- `GEMINI_API_KEY`
- `RESEND_API_KEY`
- `AUTH_SECRET`

### Installation
```bash
# Install dependencies
pnpm install

# Setup Database
pnpm --filter @careflow/database db:push
pnpm --filter @careflow/database db:generate
pnpm --filter @careflow/database prisma seed
```

### Run Locally
```bash
# Start backend
pnpm --filter api start:dev

# Start frontend
pnpm --filter web dev
```

## Concurrency Test
You can run the built-in race condition test to verify the double-booking prevention:
```bash
pnpm ts-node scripts/test-booking-race.ts
```
**Expected Output:** 1 successful booking, 19 conflicts.

## Demo Credentials
- Admin: `admin@demo.local` / `demo123`
- Doctor: `doctor@demo.local` / `demo123`
- Patient: `patient@demo.local` / `demo123`
