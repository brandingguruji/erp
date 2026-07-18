# BrandingGuruji ERP - Project Documentation

This document serves as the "brain" and context hub for AI assistants to understand the structure, data models, pages, and server actions within the project, allowing for faster navigation and development.

## 📂 1. Core Tech Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Database ORM**: Prisma Client
- **Database Provider**: MySQL
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js (`src/auth.ts`)

---

## 🗄️ 2. Database Models (`prisma/schema.prisma`)

*Run `npx prisma db push` and `npx prisma generate` after modifying these.*

1. **User**: Represents system users (Super Admin, Admin, Developer, Finance, Client). Uses role-based access control (RBAC).
2. **Client**: Core CRM model storing client companies (Fields: `companyName`, `clientName`, `gst`, `pan`, etc).
3. **Project**: Main operational entity tracking progress, budget, timelines, and technical details. Links to `Client` and `User` (Admin).
4. **Milestone & Task**: Nested under Project for project management and tracking.
5. **Payment, Invoice, PurchaseOrder**: Financial models tracking transactions and documents.
6. **GitRepository, Server, Domain**: Technical asset management models.
7. **ActivityLog**: For system-wide audit trailing.

---

## 🗺️ 3. Routing & Pages (`src/app/`)

### Public Routes
- `/login` (`src/app/login/page.tsx`): The main entry point for unauthenticated users. Uses a client-side form (`login-form.tsx`) pointing to NextAuth credentials.

### Dashboard Routes (`src/app/dashboard/`)
*All nested routes share `layout.tsx` (containing the sidebar/navbar) and require authentication.*

- **Dashboard Home**: `/dashboard` (`page.tsx`) - Overview and analytics.
- **Users Module**: `/dashboard/users` (`page.tsx`) - View, manage, and create system users.
- **Clients Module**: `/dashboard/clients` (`page.tsx`) - View and manage client accounts.
- **Projects Module**: `/dashboard/projects` (`page.tsx`) - Manage active and historical projects.

---

## ⚙️ 4. Server Actions (`actions.ts`)

These files contain the backend logic invoked directly by React Server Components or client forms. They typically authenticate the user session, validate input, and execute Prisma database queries.

- **Clients (`src/app/dashboard/clients/actions.ts`)**:
  - `createClient(formData: FormData)`: Parses form data, checks required fields, and creates a new `Client` record in the database.
  - `deleteClient(id: string)`: Enforces `SUPER_ADMIN` role and deletes the target client.

- **Projects (`src/app/dashboard/projects/actions.ts`)**:
  - `createProject(formData: FormData)`: Parses incoming data to generate a new `Project`.

*(Note: Add new server actions in their respective domain folders next to the pages that consume them).*

---

## 🧩 5. UI Components (`src/components/`)
- Shared and reusable interface elements are stored here.
- `src/components/ui/button.tsx`: Reusable button component following Tailwind and Radix/shadcn patterns (if implemented).

---

## 🔄 6. AI Development Workflow

When modifying this repository, AI agents should follow these steps:

1. **Database Changes**: Always update `schema.prisma` first. Generate the client immediately after. Ensure you double-check Prisma model typings if TypeScript compiler errors occur.
2. **Backend**: For data mutation, write an async function in the relevant `actions.ts` file. Mark with `"use server"`. Use `revalidatePath` to update UI automatically.
3. **Frontend**: Fetch data directly in React Server Components (`page.tsx`). Pass data down to Client Components (`"use client"`) only for interactivity (like Modals or Forms).
4. **Security**: Validate `session.user.role` inside Server Actions to prevent unauthorized database modifications.
