# VitalGrid

**Medical supply chain management platform for healthcare organizations in Africa.**

VitalGrid enables NGOs, governments, hospitals, and clinics to track medical inventory, coordinate inter-facility transfers, receive critical shortage and expiry alerts, and visualize facility locations on a live map — all from a single multi-tenant SaaS platform.

> 🌍 **Internationalization (i18n) — Coming Soon.** The UI is currently in French (fr-FR). Full multi-language support (English, Swahili, Arabic, Portuguese) is planned for an upcoming release.

---

## Screenshots

| Dashboard | Facilities Map | Transfer Management |
|---|---|---|
| Role-based dashboards | Live pin map with status colors | Inter-facility transfer coordination |

---

## Features

- **Multi-tenant architecture** — each organization has fully isolated data
- **Role-based access control** — 5 roles: `super_admin`, `facility_manager`, `field_agent`, `ngo_coordinator`, `auditor`
- **Inventory management** — resources, batches, movements, expiry tracking
- **Inter-facility transfers** — request, approve, track, deliver
- **Real-time alerts** — stock shortages, near-expiry batches, temperature anomalies
- **Live map** — SVG pin markers colored by facility status (Leaflet + OpenStreetMap)
- **Cold chain IoT** — DynamoDB events for temperature sensor data
- **Billing & subscriptions** — per-organization plan management (super_admin)
- **Audit log** — full activity trail
- **Demo request flow** — public landing page with access request form

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.7 (App Router, Turbopack) |
| Language | TypeScript |
| Database | Aurora DSQL (PostgreSQL-compatible, serverless, ACID) |
| IoT Events | AWS DynamoDB |
| Auth | JWT httpOnly cookies (`jose` + `bcryptjs`) |
| Styling | CSS Modules + global design tokens |
| Maps | React-Leaflet + OpenStreetMap |
| Icons | Lucide React |
| Email | SendGrid |

---

## Architecture

```
src/
├── app/
│   ├── (marketing)/          # Public site — landing, demo request, register
│   ├── dashboard/            # Authenticated app — role-based sidebar
│   ├── admin/                # Super-admin panel (organizations, billing, users)
│   ├── facilities/           # Facility management + live map
│   ├── inventory/            # Stock tracking, batches, movements
│   ├── transfers/            # Inter-facility transfer requests
│   ├── alerts/               # Alert center + history
│   ├── analytics/            # Reports, expiry risk, transfer efficiency
│   └── api/                  # Next.js Route Handlers (REST API)
├── lib/
│   ├── db.ts                 # Aurora DSQL pool + OCC retry (transact/query)
│   ├── auth.ts               # JWT helpers — signAccessToken, getSession
│   ├── tenant.ts             # requireTenant() — extracts tenantId from JWT
│   ├── api-client.ts         # apiFetch() — client-side fetch with credentials
│   └── repos/                # Repository layer — 1 file per domain
├── components/               # Shared UI — maps, country/region selectors
├── contexts/
│   └── auth.tsx              # AuthProvider + useAuth() hook
└── middleware.ts             # Edge RBAC — JWT check + role-based redirects
```

---

## Roles & Permissions

| Role | Dashboard | Capabilities |
|---|---|---|
| `super_admin` | `/dashboard/admin` | Manage all organizations, billing, system status |
| `facility_manager` | `/dashboard` | Inventory, transfers, alerts, analytics |
| `field_agent` | `/dashboard/field` | Simplified inventory, transfers, alerts |
| `ngo_coordinator` | `/dashboard/ngo` | Facilities overview, transfers, analytics |
| `auditor` | `/analytics/map` | Read-only analytics + audit log |

---

## Getting Started

### Prerequisites

- Node.js 20+
- An AWS account with Aurora DSQL cluster + DynamoDB table
- A SendGrid API key (optional — for email notifications)

### 1. Clone & Install

```bash
git clone https://github.com/Peter23xp/vitalgrid.git
cd vitalgrid
npm install
```

### 2. Environment Variables

Create `.env.local`:

```env
DSQL_CLUSTER_ENDPOINT=your-cluster.dsql.us-east-1.on.aws
DSQL_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key-id
AWS_SECRET_ACCESS_KEY=your-secret-key
JWT_SECRET=your-64-char-minimum-secret
SENDGRID_API_KEY=SG.xxxx
NEXT_PUBLIC_TENANT_ID=your-org-uuid
DYNAMODB_REGION=us-east-1
DYNAMODB_TABLE_COLD_CHAIN=cold_chain_events
```

### 3. Run Migrations

```bash
# Main schema (12 tables)
npx tsx --env-file=.env.local scripts/migrate.ts

# Auth columns
npx tsx --env-file=.env.local scripts/migrate-auth.ts

# Demo request table (marketing)
npx tsx --env-file=.env.local scripts/migrate-access-requests.ts

# DynamoDB cold-chain events table
npx tsx --env-file=.env.local scripts/setup-dynamodb.ts
```

### 4. Create First Admin

```bash
npx tsx --env-file=.env.local scripts/create-user.ts \
  --email admin@vitalgrid.io \
  --password VitalGrid2026! \
  --role super_admin \
  --org-name "VitalGrid" \
  --name "Admin VitalGrid"
```

### 5. Seed Demo Data (optional)

```bash
npx tsx --env-file=.env.local scripts/seed-demo.ts
```

This creates 9 organizations across 5 African countries (DRC, Rwanda, Kenya, Uganda, Tanzania) with realistic facilities, medical resources, transfers, and alerts.

**Demo accounts (password: `Demo2026!`):**
- `admin.msf-congo@vitalgrid.io` — MSF Congo (ngo_coordinator)
- `admin.unicef-rdc@vitalgrid.io` — UNICEF RDC (ngo_coordinator)
- `admin.ministere-de-la-sante-rdc@vitalgrid.io` — Ministry of Health DRC
- `admin.ministry-of-health-kenya@vitalgrid.io` — MoH Kenya
- + managers for each facility

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

| URL | Description |
|---|---|
| `/` | Public landing page |
| `/login` | Login |
| `/demo` | Request demo access |
| `/dashboard/admin` | Super-admin panel |
| `/facilities/map` | Live facilities map |

---

## Key Design Decisions

**OCC (Optimistic Concurrency Control)** — Aurora DSQL uses OCC instead of pessimistic locking. All mutations use the `transact()` helper which auto-retries on conflict errors.

**JWT in httpOnly cookies** — Access token (`vg_access`, 15min) + refresh token (`vg_refresh`, 7d). No localStorage. CSRF-safe via same-origin cookie policy.

**Tenant isolation via JWT** — `requireTenant(req)` extracts `tenantId` from the JWT payload. No `x-tenant-id` header — prevents tenant spoofing.

**Edge middleware RBAC** — Route protection happens at the Edge before any page renders. Unauthorized roles are redirected before the React tree loads.

**`ensureTable()` pattern** — Some tables (subscriptions) are auto-created on first API call because IAM restrictions prevent running migration scripts directly in some environments.

---

## Scripts Reference

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npx tsx --env-file=.env.local scripts/migrate.ts` | Run main schema migration |
| `npx tsx --env-file=.env.local scripts/seed-demo.ts` | Seed 9 demo organizations |
| `npx tsx --env-file=.env.local scripts/create-user.ts` | Create a user account |
| `npx tsx --env-file=.env.local scripts/seed-facility.ts <email>` | Assign facility to user |

---

## Roadmap

- [ ] **i18n** — English, Swahili, Arabic, Portuguese *(coming soon)*
- [ ] Mobile app (React Native) for field agents
- [ ] Offline-first sync for low-connectivity zones
- [ ] Temperature anomaly ML detection
- [ ] SMS alerts via Twilio
- [ ] PDF report generation

---

## License

MIT

---

*Built for the H0 Hackathon — VitalGrid Dev*
