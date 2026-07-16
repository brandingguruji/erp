# AI Context & Developer Guide
**Project:** Branding Guruji ERP System

This document is specifically designed to help AI coding assistants (and developers) immediately understand the project architecture, tech stack, standard operating procedures, and current state. Read this before suggesting architectural changes or writing new modules.

---

## 1. Tech Stack
- **Framework:** Next.js (App Router)
- **Database ORM:** Prisma
- **Database:** MySQL
- **Authentication:** NextAuth.js / Auth.js (Credentials Provider)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Component Library:** Shadcn UI (or similar custom Zinc-themed Radix UI components)
- **Security:** `bcryptjs` for password hashing

---

## 2. Project Architecture & Flow

### Global Flow
1. **Authentication:** All routes under `/dashboard/*` are protected. `auth.ts` handles the Credentials authentication flow. `session.user` contains `id`, `email`, `name`, and `role`.
2. **Database:** Prisma schema is the single source of truth (`prisma/schema.prisma`). Any schema changes require `npx prisma db push` followed by `npx prisma generate`. (Note: `npm run dev` must be stopped during generation on Windows to avoid `EPERM` file lock errors).
3. **Server Actions:** Data mutations (create, update, delete) are handled strictly via Next.js Server Actions (`"use server"`) usually located in an `actions.ts` file within the feature's directory.

### Directory Structure
```text
c:\Development\brandingguruji-erp\
├── .env                              # MySQL Database URL and AUTH_SECRET (Required)
├── prisma/
│   └── schema.prisma                 # Core Models: User, Client, Project, Task, Invoice, etc.
├── scripts/
│   └── seed-admin.mjs                # Initial database script to create the first SUPER_ADMIN
└── src/
    ├── auth.ts                       # NextAuth configuration and auth handler
    ├── lib/
    │   └── prisma.ts                 # Global Prisma client singleton
    └── app/
        ├── login/                    # Public login route
        └── dashboard/                # Protected Application Routes
            ├── layout.tsx            # Wraps protected routes
            ├── sidenav.tsx           # Global sidebar navigation
            ├── clients/              # Client CRM Module (List, Form, Actions)
            ├── projects/             # Project Management Module
            └── users/                # User Management Module (RBAC assignment)
```

---

## 3. Standard Operating Procedure (SOP) for Adding New Features

When asked to create a new module (e.g., "Invoices"), follow this exact flow:

1. **Schema Update:** Add the model to `prisma/schema.prisma`.
2. **Database Sync:** Run `npx prisma db push` and `npx prisma generate` (Ensure Next.js server is stopped).
3. **Server Actions (`actions.ts`):** Create a dedicated `actions.ts` file in the new route (`src/app/dashboard/invoices/actions.ts`). Ensure it includes an authentication and role check (e.g., `if (!session) throw Error...`).
4. **UI Components:** 
   - Build `page.tsx` for displaying the list (fetch data directly using Prisma since it's a Server Component).
   - Build `[feature]-form-modal.tsx` (Client Component) for creating/editing records.
5. **Navigation:** Add the new route to the `navLinks` array in `src/app/dashboard/sidenav.tsx`.

---

## 4. Current State & Known Quirks

- **Role Based Access Control (RBAC):** The system uses an Enum `Role` (SUPER_ADMIN, ADMIN, DEVELOPER, FINANCE, CLIENT).
- **Client Creation Override:** Currently, the strict RBAC check in `src/app/dashboard/clients/actions.ts` (`createClient`) is **commented out** for development purposes so standard users can create clients while testing. Re-enable this check before production deployment.
- **Select Inputs in React:** Always use `defaultValue=""` instead of `selected` on `<option>` tags inside forms to avoid React hydration warnings.
- **Passwords:** All passwords must be hashed with `bcryptjs` before inserting into the Prisma database.
