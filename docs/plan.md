## Plan: Fazenda Conectada MVP Architecture & Roadmap

This plan outlines the architecture, setup, and development sprints for the "Fazenda Conectada" event management MVP using Next.js 14 (App Router) and Supabase.

**Sprints & Action Plan**

**Sprint 1: Foundation & External Services**
1. **Supabase Setup**: Create a new project in the Supabase dashboard. Obtain the Project URL and Anon Key.
2. **Database Initialization**: Execute SQL scripts in the Supabase SQL Editor to create the `customers`, `events`, `payments`, and `calendar_locks` tables. Set up Row Level Security (RLS) to restrict access to authenticated admins only.
3. **Resend Setup**: Create a Resend account, verify the sender domain, and obtain the API key for email OTP authentication. Connect it to Supabase Auth settings.
4. **Next.js Project Initialization**: Run `npx create-next-app@latest` with App Router, TypeScript, and Tailwind CSS configured.
5. **shadcn/ui Setup**: Initialize shadcn/ui (`npx shadcn-ui@latest init`) and install core components (Button, Input, Form, Dialog, Table, Calendar).

**Sprint 2: Authentication & Core Architecture**
1. **Supabase Auth Integration**: Implement standard Next.js Supabase Server/Client clients.
2. **Login/Auth Flows**: Create the login page with Email OTP and Google OAuth buttons.
3. **Protected Routes**: Implement a Next.js Middleware to protect `/dashboard` and its sub-routes, ensuring only authenticated users can access them.
4. **Layouts**: Create a shared dashboard layout with a sidebar navigation (Dashboard, Bookings, Calendar, Settings).

**Sprint 3: Core Entities Management (CRUD)**
1. **Customers & Events UI**: Build listing pages (Tables) and creation/edit forms for Customers and Events using Server Actions for data mutation.
2. **Booking Logic & Conflict Prevention**: Implement the `createBooking` server action. Before inserting an event, query both `events` and `calendar_locks` for overlapping dates. If an overlap exists, throw a validation error.
3. **Calendar Locks**: Build a simple UI to block dates for maintenance or holidays.

**Sprint 4: Financials & Dashboard**
1. **Payments Tracking**: Create a sub-view within an Event details page to manage payment installments (pending, paid).
2. **Dashboard Overview**: Implement server components to aggregate and display upcoming weddings, total pending payments, and recent bookings.

**Sprint 5: Automation & Deployment**
1. **Contract PDF Generation**: Integrate a PDF generation library (e.g., `@react-pdf/renderer` or `jspdf`) to map event/customer data into a rustic-elegant styled contract template.
2. **Vercel Deployment**: Push the repository to GitHub, connect it to Vercel, and configure environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `RESEND_API_KEY`).

**Directory Structure (Next.js App Router)**
The project will follow a modular, scalable approach:
- `src/app`: App Router pages, layouts, and API routes.
  - `(auth)`: Login pages.
  - `(dashboard)`: Protected routes (overview, events, customers).
- `src/components`: Reusable UI components.
  - `ui`: shadcn/ui primitives.
  - `features`: Domain-specific components (e.g., `EventForm`, `PaymentTracker`).
- `src/lib`: Utility functions and clients (Supabase clients, cn utility).
- `src/actions`: Next.js Server Actions (e.g., `event.actions.ts`, `customer.actions.ts`).
- `src/types`: TypeScript definitions (e.g., `database.ts`).

**Database Schema & Validation Strategy**
The `types/database.ts` will mirror the PostgreSQL schema, defining interfaces for `Customer`, `Event`, `Payment`, and `CalendarLock`. 
For the `createBooking` Server Action, the critical logic involves a PostgreSQL transaction or a pre-insert query that checks for existing events with `status != 'cancelled'` or `calendar_locks` that intersect with the requested `event_date`. 

**Decisions**
- Chose Server Actions over API Routes for direct, type-safe database mutations and reduced client-side Javascript.
- Chose Supabase for an all-in-one Auth and PostgreSQL solution, accelerating MVP delivery while maintaining robust RLS security.