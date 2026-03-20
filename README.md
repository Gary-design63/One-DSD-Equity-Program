# One DSD Equity Program

**Minnesota Department of Human Services — Disability Services Division**
Equity and Inclusion Operations Platform

---

## Live Application

**Production URL:** https://equity-layout-shell.lovable.app

DSD staff access the app at the URL above. The application is deployed automatically from the `main` branch via Lovable whenever code is pushed.

---

## What This Is

The One DSD Equity Program platform is the operational hub for DSD's equity work. It provides:

- **Dashboard** — KPI monitoring, active workflow runs, program actions, and risk register
- **Knowledge Base** — Governing documents, equity tools, and program references organized by authority level
- **Workflows** — Guided processes for equity scans, full analyses, accessibility reviews, and community engagement
- **Templates** — Operational forms and worksheets for all program workflows
- **Metrics** — Key performance indicators with trend tracking
- **Learning** — Equity educational resources and staff development assets
- **Assistant** — AI-assisted equity guidance (in development)
- **Roles** — Role governance and decision authority documentation (admin only)
- **Actions** — Program action item tracker (admin only)
- **Risks** — Program risk register (admin only)

---

## Cloud Architecture

The system runs entirely in the cloud — no local hosting required.

| Layer | Platform | Details |
|-------|----------|---------|
| Frontend | Lovable | React/Vite/TypeScript, auto-deployed from GitHub `main` |
| Database & Auth | Supabase | `pmwqakhmcudwokupzsfj.supabase.co` |
| Source code | GitHub | `Gary-design63/One-DSD-Equity-Program` |

For full architecture details, access controls, data residency, backup procedures, and handoff planning, see **[CLOUD-ARCHITECTURE.md](./CLOUD-ARCHITECTURE.md)**.

---

## Technology Stack

- **React 18** with TypeScript
- **Vite** build tool
- **Tailwind CSS** + shadcn/ui component library
- **Supabase** (PostgreSQL + Auth + Storage)
- **Lovable** (build and hosting platform)
- **Lucide React** icons

---

## Development

### Prerequisites
- Node.js 18+ and npm
- Access to the Supabase project (contact Gary Bellows)
- Environment variables configured (see below)

### Environment Variables

Create a `.env.local` file at the project root (this file is gitignored — never commit secrets):

```
VITE_SUPABASE_URL=https://pmwqakhmcudwokupzsfj.supabase.co
VITE_SUPABASE_ANON_KEY=<get from Supabase dashboard — anon/public key only>
```

### Local Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Deploying

Push to the `main` branch. Lovable automatically builds and deploys within ~60 seconds.

Do not push secrets, `.env` files, or service role keys to GitHub.

---

## Contributing

The active development branch is `claude/convert-elearning-to-html-3Kzfn`. All changes go to that branch first, then merge to `main` for deployment.

For questions about the equity program itself, contact:
**Gary Bellows** — gary.bellows@state.mn.us
Equity and Inclusion Operations Consultant, Disability Services Division
