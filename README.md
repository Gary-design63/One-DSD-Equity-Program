# One DSD Equity Program

An AI-powered DEIA (Diversity, Equity, Inclusion, and Accessibility) operations system for the Equity and Inclusion Operations Consultant serving the Minnesota Department of Human Services, Disability Services Division (DSD).

The system enables one Consultant to operate at the capacity of a coordinated team — serving approximately 150 DSD staff members — through a multi-agent AI infrastructure.

---

## Architecture

| Layer | Technology | Host |
|---|---|---|
| Frontend | Vanilla JS SPA | GitHub Pages (free) |
| Backend | Node.js + Express + WebSocket | Hostinger KVM 2 VPS ($8.99/mo) |
| AI Engine | 7 Claude agents via Anthropic API | Anthropic (claude-opus-4-6 / claude-sonnet-4-6) |
| Database | SQLite | Local file on VPS |

The frontend is static and always available. AI agent features require the backend to be running on the VPS.

---

## AI Agents

| Agent | Role |
|---|---|
| **Equity Compass** (coordinator) | Routes requests, synthesizes multi-domain answers |
| **Policy Navigator** | ADA, MNDHR, state policy, compliance |
| **Workflow Architect** | Process design, workflow stage management |
| **Metrics Intelligence** | KPI tracking, trend analysis, reporting |
| **Learning Curator** | Training programs, microlearning, staff development |
| **Risk & Action Monitor** | Overdue actions, escalations, accountability |
| **Community Intelligence** | Stakeholder engagement, outreach, co-design |

---

## Quick Start (Local Development)

**Frontend only** (no backend required — runs in static fallback mode):

```sh
# Serve the public/ directory with any static server
npx serve public
# or
python3 -m http.server 8080 --directory public
```

**With backend:**

```sh
# Terminal 1 — backend
cd backend
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
npm install
npm run dev

# Terminal 2 — frontend
# Edit index.html and uncomment:
# <script>window.AGENT_API_URL = 'http://localhost:3000';</script>
npx serve public -p 8080
```

---

## Deployment

- **Frontend:** Push to `main` → GitHub Actions automatically deploys to GitHub Pages
- **Backend:** See [`backend/DEPLOY.md`](backend/DEPLOY.md) for the full Hostinger VPS setup guide

**Recommended VPS:** Hostinger KVM 2 ($8.99/mo) — all AI computation is offloaded to Anthropic, so the VPS only runs Node.js + SQLite. See DEPLOY.md for plan comparison and reasoning.

---

## Project Structure

```
One-DSD-Equity-Program/
├── public/                   # Frontend SPA (deployed to GitHub Pages)
│   ├── index.html            # App shell
│   ├── app.js                # Page routing and rendering
│   ├── agent.js              # WebSocket client for AI agents
│   ├── data.js               # Static program data
│   ├── auth.js               # Azure AD authentication
│   └── crud.js               # CRUD operations
├── backend/                  # Node.js agent server (deployed to VPS)
│   ├── server.js             # Express + WebSocket server
│   ├── agents/               # 7 Claude AI agents
│   ├── tools/                # Agent tool implementations
│   ├── db/                   # SQLite schema and queries
│   ├── .env.example          # Environment variable template
│   └── DEPLOY.md             # VPS deployment guide
├── .github/workflows/
│   └── deploy.yml            # GitHub Pages CI/CD
└── PRD.md                    # Full product requirements and system spec
```

---

## Operating Costs

| Item | Cost |
|---|---|
| Frontend hosting (GitHub Pages) | Free |
| Backend VPS (Hostinger KVM 2) | $8.99/mo |
| Anthropic API — light use (1-2 queries/day) | ~$20-40/mo |
| Anthropic API — moderate use (5-10 queries/day) | ~$80-150/mo |
| **Total (moderate use)** | **~$90-160/mo** |
