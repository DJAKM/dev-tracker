# DAxis Engineering Consultancy — Schema & Implementation Plan

**Stack:** Next.js 15 (App Router) full-stack · TypeScript · Supabase (Postgres) · Resend
**Approach:** Server-side secure backend, built to scale.
**Status:** Planning (no application code yet — this document is the blueprint).

---

## 0. Key Decisions (locked)

| Decision | Choice | Why |
|---|---|---|
| Framework | **Next.js 15.x** (latest stable, App Router, not 16) | SSR/SSG, SEO, full-stack in one codebase |
| Language | TypeScript (strict) | Matches existing repo, safety at scale |
| DB | Supabase Postgres (`ap-south-1`) | Managed Postgres + future Auth/Storage |
| DB access | **Server-side only via `service_role`** (never in browser) | More secure than anon-insert; key stays on server |
| Form handling | **React Server Action / Route Handler** + Zod validation | Validation can't be bypassed by client |
| Email | Resend, sent from server after successful insert | Decoupled, retryable |
| Spam/abuse | Honeypot + Cloudflare Turnstile + Upstash rate-limit | Repo already has Upstash Redis |
| Admin view | Phase 2: protected `/admin` using existing NextAuth | "Out of scope" in PRD v2 but planned for scale |
| Hosting | Vercel (frontend + API) + Supabase (DB) | Zero-config Next.js, free tier |

> **Security rationale:** The PRD's original design lets the browser insert directly with the `anon` key. That works but exposes the table to any actor with the public key (spam, scripted inserts). Routing the insert through a Next.js Server Action means: validation is enforced server-side, the `service_role` key never reaches the browser, RLS denies all anonymous DB access, and we can rate-limit + bot-check before writing. This is the more secure **and** more scalable path.

---

## 1. Database Schema

Design goals beyond the PRD: stable non-guessable IDs (UUID), audit/spam columns, DB-driven service catalog, status workflow, email delivery tracking, and an activity log — all so a future admin dashboard and higher volume need no migration rewrite.

### 1.1 Extensions & Enums

```sql
create extension if not exists "pgcrypto";   -- gen_random_uuid()

create type enquiry_status as enum ('new', 'contacted', 'qualified', 'closed', 'spam');
create type enquiry_source as enum ('website', 'referral', 'phone', 'email', 'other');
```

### 1.2 `services` — DB-driven dropdown (future-proof)

Instead of hard-coding the 7 dropdown options in HTML, store them so they can be edited without a deploy.

```sql
create table services (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,        -- 'engineering-design'
  name        text not null,               -- 'Engineering Design & Drafting'
  description text,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);
```

Seed: the 6 core services + “Other / Not Sure”.

### 1.3 `enquiries` — main lead table

```sql
create table enquiries (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  -- Required
  full_name        text not null check (char_length(full_name) between 2 and 120),
  email            text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone            text not null check (phone ~ '^[6-9][0-9]{9}$'),  -- 10-digit India

  -- Optional
  company_name     text,
  service_id       uuid references services(id) on delete set null,
  service_label    text,                    -- snapshot of label at submit time
  city             text,
  message          text check (message is null or char_length(message) <= 500),

  -- Workflow
  status           enquiry_status not null default 'new',
  source           enquiry_source not null default 'website',
  assigned_to      uuid,                    -- future: admin user id

  -- Audit / anti-spam
  ip_address       inet,
  user_agent       text,
  is_spam          boolean not null default false,

  -- Email delivery tracking
  notified         boolean not null default false,
  notified_at      timestamptz,
  notify_attempts  int not null default 0,
  resend_message_id text
);

create index idx_enquiries_created_at on enquiries (created_at desc);
create index idx_enquiries_status     on enquiries (status);
create index idx_enquiries_email      on enquiries (lower(email));
```

`updated_at` is kept current via a trigger:

```sql
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger trg_enquiries_updated
  before update on enquiries
  for each row execute function set_updated_at();
```

### 1.4 `enquiry_events` — activity log (future admin/CRM)

```sql
create table enquiry_events (
  id          uuid primary key default gen_random_uuid(),
  enquiry_id  uuid not null references enquiries(id) on delete cascade,
  type        text not null,               -- 'created' | 'status_changed' | 'note' | 'email_sent'
  detail      jsonb,
  actor       text,                        -- 'system' | admin email
  created_at  timestamptz not null default now()
);
create index idx_events_enquiry on enquiry_events (enquiry_id, created_at desc);
```

### 1.5 `email_log` — observability

```sql
create table email_log (
  id           uuid primary key default gen_random_uuid(),
  enquiry_id   uuid references enquiries(id) on delete set null,
  to_address   text not null,
  subject      text,
  provider     text default 'resend',
  status       text,                        -- 'sent' | 'failed'
  provider_id  text,
  error        text,
  created_at   timestamptz not null default now()
);
```

### 1.6 Row Level Security

Because all writes go through the server with `service_role` (which **bypasses RLS**), we lock the tables down completely for `anon`/`authenticated`:

```sql
alter table enquiries      enable row level security;
alter table enquiry_events enable row level security;
alter table email_log      enable row level security;
alter table services       enable row level security;

-- services: public can read active rows (only if we ever read from client)
create policy "services public read"
  on services for select to anon using (is_active = true);

-- enquiries/events/email_log: NO anon/authenticated policies => fully blocked.
-- service_role bypasses RLS and is the only writer/reader.
```

> If you later prefer the PRD’s direct-from-browser insert, add an `INSERT`-only policy for `anon` — but the server-side path above is recommended.

### 1.7 ER overview

```
services ──< enquiries ──< enquiry_events
                 │
                 └──< email_log
```

---

## 2. Application Architecture

```
Browser (Next.js Client Components, Tailwind, Framer Motion)
   │  progressive-enhanced <form> + Turnstile token
   ▼
Server Action  /  Route Handler  (Next.js, runs on Vercel)
   │  1. Upstash rate-limit (IP)      4. insert via supabase-js (service_role)
   │  2. Zod validate                 5. log enquiry_event 'created'
   │  3. verify Turnstile + honeypot   6. fire Resend email -> email_log + mark notified
   ▼
Supabase Postgres            Resend API  ──►  admin inbox (daxis.engg@gmail.com)
```

- **Two clients:** a browser `supabase` client is **not** used for writes; a server-only client built with `SUPABASE_SERVICE_ROLE_KEY` handles all DB I/O inside `lib/supabase/server.ts`.
- **Email is sent inline** from the server action after insert. If a send fails, the row still exists and `notify_attempts` lets a cron/Edge Function retry — no lost leads.
- **Scale path (documented, not built day 1):** swap inline email for a Supabase DB Webhook → Edge Function, or a Vercel Cron that drains `notified = false`. Schema already supports it.

---

## 3. Proposed Project Structure (additive to existing repo)

```
app/
  (site)/
    page.tsx                 # Home: hero, stats, services, profile, projects, clients, why-us
    layout.tsx               # site shell: sticky header, footer, fonts, metadata
    contact/page.tsx         # (optional 2nd page) or #contact anchor on home
  api/
    enquiries/route.ts       # POST handler (alt to server action)
  admin/                     # Phase 2 — protected by existing NextAuth
    page.tsx                 # enquiry list + status update
  sitemap.ts  robots.ts  opengraph-image.tsx
components/
  daxis/                     # Header, Hero, StatsBar, ServiceCard, ConsultantProfile,
                             # ProjectCard, ClientMarquee, USPCard, ContactForm, Toast
lib/
  supabase/server.ts         # service_role client (server only)
  validation/enquiry.ts      # Zod schema (shared client+server)
  email/resend.ts            # Resend wrapper + HTML template
  rate-limit.ts              # Upstash ratelimit (reuse existing dep)
  actions/submit-enquiry.ts  # server action
data/
  services.ts  projects.ts  clients.ts  usps.ts   # static content
supabase/
  migrations/0001_init.sql   # all SQL from section 1
  seed.sql
```

---

## 4. UI / Design System

| Concern | Library / Approach |
|---|---|
| Styling | **Tailwind CSS v4** (already in repo) with PRD color tokens as CSS vars |
| Components | **shadcn/ui** (Radix-based, accessible) for inputs, select, toast, dialog |
| Animation | **Framer Motion** — hero `fadeInUp`, staggered card reveals, marquee |
| Counters | `react-countup` or IntersectionObserver for stats count-up |
| Fonts | `next/font/google` → Bebas Neue, Rajdhani, DM Sans, Space Mono (self-hosted, no layout shift) |
| Forms | `react-hook-form` + `@hookform/resolvers/zod` (shared Zod schema) |
| Icons | `lucide-react` |
| Bot check | `@marsidev/react-turnstile` (Cloudflare Turnstile) |

**Color tokens** (PRD §8.2) → `app/globals.css` as `--primary`, `--accent`, etc.
**Responsive:** mobile-first, breakpoints 375 / 768 / 1024 / 1280. All sections fluid; services 1-col → 3-col grid.
**Accessibility:** semantic landmarks, focus rings, `prefers-reduced-motion` disables animation, color-contrast AA, labeled inputs.
**SEO:** `metadata` API, OpenGraph image, JSON-LD `LocalBusiness` / `Organization`, `sitemap.ts`, `robots.ts`.

---

## 5. Validation Rules (single source of truth — Zod)

| Field | Rule |
|---|---|
| `full_name` | required, 2–120 chars |
| `email` | required, RFC-ish email regex |
| `phone` | required, `^[6-9]\d{9}$` (10-digit India) |
| `company_name` | optional, ≤120 |
| `service_id` | optional, must exist in `services` |
| `city` | optional, ≤80 |
| `message` | optional, ≤500 (live counter in UI) |
| `website` (honeypot) | must be empty — hidden field |
| `turnstileToken` | required, verified server-side |

The same schema validates on the client (instant UX) and on the server (authoritative). DB `CHECK` constraints are the final backstop.

---

## 6. Security & Scalability Checklist

**Security**
- `service_role` key only in server env (`SUPABASE_SERVICE_ROLE_KEY`), never `NEXT_PUBLIC_*`.
- RLS denies all anon/authenticated access; server is sole writer.
- Server-side Zod validation + DB CHECK constraints.
- Cloudflare Turnstile + honeypot to stop bots.
- Upstash rate-limit per IP (e.g. 5 submissions / 10 min).
- Sanitize/escape all values in the email HTML template (prevent header/HTML injection).
- Security headers via `next.config` / middleware (CSP, HSTS, X-Frame-Options).
- Capture `ip_address`/`user_agent` for abuse forensics only.

**Scalability**
- UUID PKs (no enumeration, shard-friendly).
- Indexes on `created_at`, `status`, `lower(email)`.
- Supabase connection **pooler** (PgBouncer) URL for serverless.
- Static/ISR for marketing pages → CDN-cached, near-zero DB load.
- Email decoupling path ready (webhook/cron) without schema change.
- Service catalog & content table-driven for growth.
- Stateless server actions → horizontal scale on Vercel automatically.

---

## 7. Environment Variables (add to `.env.example`)

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=        # server only
# (anon key only if any client read is added)
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Resend
RESEND_API_KEY=
ADMIN_EMAIL=daxis.engg@gmail.com
EMAIL_FROM="DAxis Website <onboarding@resend.dev>"

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Upstash (already present) used for rate limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## 8. Implementation Phases

> **Note on repo state:** this branch currently holds an unrelated `dev-tracker` app. Phase 0 decides whether DAxis replaces it or lives alongside — confirm before building.

### Phase 0 — Foundations (0.5 day)
- Confirm repo strategy (replace dev-tracker vs. new app dir).
- Pin Next.js to latest 15.x; add deps (tailwind already there): shadcn/ui, framer-motion, react-hook-form, zod, @supabase/supabase-js, resend, react-countup, lucide-react, turnstile, @upstash/ratelimit.
- Create Supabase project (ap-south-1); set env vars locally + on Vercel.

### Phase 1 — Database (0.5 day)
- Write `supabase/migrations/0001_init.sql` (Section 1) + `seed.sql`.
- Apply via Supabase SQL editor / CLI; verify RLS with anon client (should be denied).

### Phase 2 — Backend (1–1.5 days)
- `lib/supabase/server.ts`, `lib/validation/enquiry.ts`, `lib/email/resend.ts`, `lib/rate-limit.ts`.
- Server action `submit-enquiry.ts`: rate-limit → Turnstile → Zod → insert → event log → email → email_log.
- Unit-test validation + a happy-path/spam-path integration test.

### Phase 3 — Frontend marketing site (2–3 days)
- Layout shell: sticky header + smooth-scroll nav + "Get a Quote" CTA + footer.
- Sections per PRD §7: Hero, Stats bar, 6 Service cards, Consultant profile, 5 Project cards, Client marquee, 5 USP cards.
- Fonts, color tokens, Framer Motion reveals, count-up, marquee, reduced-motion.

### Phase 4 — Contact form (1 day)
- `ContactForm` (react-hook-form + Zod), 7 fields + honeypot + Turnstile.
- Loading / success / error states + toast; live 500-char counter.
- Wire to server action; end-to-end test → row in DB + email received.

### Phase 5 — SEO, polish, a11y (0.5–1 day)
- Metadata, OG image, JSON-LD, sitemap/robots, favicon/manifest.
- Lighthouse pass (perf/SEO/a11y ≥ 90), responsive QA at 375/768/1280.

### Phase 6 — Admin dashboard (Phase 2 / optional, 1–2 days)
- `/admin` behind existing NextAuth; list, filter by status, update status, view message.
- Server actions write `enquiry_events`.

### Phase 7 — Deploy (0.5 day)
- Vercel project, env vars, custom domain, Resend domain verification (replace `onboarding@resend.dev`).
- Smoke test prod; hand over.

**Rough total:** ~7–10 working days for Phases 0–5 (public site live); +1–2 for admin.

---

## 9. Acceptance Criteria Mapping (PRD §10)

| PRD criterion | Covered by |
|---|---|
| 7-field insert into Supabase | Phase 1 schema + Phase 4 form/action |
| Client-side required validation | Zod + react-hook-form (Phase 4) |
| Email alert on submission | Resend inline send (Phase 2) |
| Success/error states | Phase 4 form states + toast |
| 6 services displayed | Phase 3, table-driven |
| Responsive ≥375px | Phase 3/5 mobile-first |
| anon key not misused / service_role server-only | Section 6 security |
| Sticky header + smooth scroll | Phase 3 layout |
| Hero / stats / marquee / hover / loading anims | Phase 3/4 (Framer Motion) |
| SEO meta tags | Phase 5 |

---

## 10. Open Questions / Risks

1. **Repo strategy** — replace `dev-tracker` on this branch, or scaffold DAxis in a subfolder? (Phase 0 blocker.)
2. **Domain & sender** — do we have a domain to verify in Resend, or ship with `onboarding@resend.dev` for launch?
3. **Two-page vs SPA** — PRD says "2-page SPA"; plan treats it as one long home page with a `#contact` anchor (+ optional `/contact`). Confirm.
4. **Content** — final copy for projects, client names, consultant bio, stats figures needed before Phase 3.
5. **Turnstile** — requires a free Cloudflare account; acceptable?
```
