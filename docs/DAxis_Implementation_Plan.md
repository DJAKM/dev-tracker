# DAxis Engineering Consultancy — Complete Implementation Plan

**Version:** 2.0 (complete, standalone — client + backend-developer detail)
**Date:** May 2026
**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind v4 + shadcn/ui · Supabase (Postgres) · Resend
**Target repo:** new dedicated repository (this document is portable — copy `docs/` into it)
**Status:** Planning complete. No app code yet — this is the build blueprint.

> This document has two tracks: **PART I — Client Track** (non-technical, for DAxis / Sunil Sharma) and **PART II — Backend-Developer Track** (exhaustive technical detail). A full security-hardening section and a human-readable schema are included.

---

# PART I — CLIENT TRACK (non-technical, for DAxis / Sunil Sharma)

## A. What you are getting (in plain language)
- A professional one-page website (with smooth-scrolling sections) for DAxis Engineering Consultancy.
- Sections: top menu bar, hero banner, key stats, 6 services, your consultant profile, 5 featured projects, scrolling client names, "why choose us", an enquiry form, and a footer.
- A working **enquiry form**: when a visitor submits it, the lead is **saved in a database** and an **email alert** lands in `daxis.engg@gmail.com` instantly.
- Works perfectly on **mobile, tablet, and desktop**.

## B. How the enquiry flow works (your day-to-day)
1. A visitor fills the form (name, email, phone, + optional company, service, city, message).
2. You receive an email at `daxis.engg@gmail.com` titled "New Enquiry from [Name] — DAxis Website".
3. Every lead is also stored permanently; you view/search them in the **Supabase dashboard** (a simple web table login).
4. Each lead has a status you can change: New → Contacted → Qualified → Closed.

## C. What we need from YOU before we start (content checklist)
| Item | Detail needed |
|---|---|
| Hero text | Main headline + one supporting line + 2 button labels |
| Stats | Confirm: years of experience, # services, # clients (PRD says 20+/6/10+) |
| Service descriptions | One sentence for each of the 6 services |
| Consultant profile | Sunil Sharma's bio (4–6 lines), photo, list of software you use (e.g. AutoCAD, STAAD) |
| Projects | 5 projects: title, client, what you did, year |
| Clients | List of ~11 client names for the scrolling strip |
| Why choose us | 5 short selling points |
| Logo & brand | DAxis logo (PNG/SVG), preferred colors if different from PRD |
| Contact | Confirm phone `+91-9910461833`, email `daxis.engg@gmail.com`, address |

## D. Accounts you'll need (all free, we set them up with you)
| Account | Purpose | Cost |
|---|---|---|
| Supabase | Stores all enquiries (the database) | Free |
| Resend | Sends the email alerts | Free (3,000 emails/month) |
| Cloudflare | Blocks spam bots on the form | Free |
| Vercel | Hosts the website | Free |
| Upstash | Prevents form abuse/flooding | Free |
| Domain (optional) | e.g. `daxisengg.com` for a branded URL + branded email sender | ~₹800–1,200/yr (optional) |

## E. Cost summary
- **₹0/month** on free tiers — sufficient for years of normal traffic.
- Only optional cost is a custom domain name (one-time yearly), recommended for credibility and branded emails.

## F. Timeline (estimate)
- **~7–10 working days** to a live public site (once content is provided).
- +1–2 days if you want the optional in-house admin dashboard (otherwise you use Supabase's built-in table view).

## G. What happens after launch (maintenance)
- The site runs itself; no servers to manage.
- To edit services or text later, the developer makes a quick change (content is kept in simple files).
- You'll get a short "how to read your leads" guide for the Supabase dashboard.

## H. Privacy & data note
- Enquiry data (name, email, phone, message) is stored securely; only DAxis (via the admin login) can read it.
- We capture basic technical info (IP/browser) only to stop spam.
- Recommended: add a one-line privacy note near the form.

---

# PART II — BACKEND-DEVELOPER TRACK (exhaustive technical detail)

## I. Locked decisions
| # | Topic | Decision |
|---|---|---|
| D1 | Framework | Next.js 15.x App Router, TypeScript strict |
| D2 | Repo | New standalone repo (portable from here) |
| D3 | DB | Supabase Postgres, region `ap-south-1` |
| D4 | DB access | Server-only via `service_role`; browser never writes |
| D5 | Form | React Server Action + Zod (authoritative server-side) |
| D6 | Email | Resend, sent inline post-insert; retry-safe via tracking columns |
| D7 | Pages | One long home page + smooth-scroll anchors; `/contact` optional |
| D8 | Sender | `onboarding@resend.dev` at launch → verified domain later |
| D9 | Anti-spam | Cloudflare Turnstile + honeypot + Upstash rate-limit |
| D10 | Admin | Phase 6 (NextAuth-protected); v1 uses Supabase dashboard |
| D11 | Hosting | Vercel + Supabase |

## J. Architecture & request lifecycle
```
Browser (Client Component form + Turnstile widget)
   │ Server Action invocation (form fields)
   ▼
Next.js Server (Vercel function)
   1 Upstash rate-limit (key = ip)         → friendly error if exceeded
   2 Honeypot check (website field empty?) → if filled: record is_spam, return ok, skip email
   3 Turnstile siteverify (server→CF)       → reject on failure
   4 Zod parse/validate                     → field errors returned to form
   5 Resolve service_id → service_label     (select from services)
   6 Insert enquiries (service_role client) → capture ip_address, user_agent
   7 Insert enquiry_events 'created'
   8 Resend send → on ok set notified+resend_message_id, email_log 'sent'
                  → on fail: notify_attempts++, email_log 'failed' (lead still saved)
   9 Return { ok:true } | { ok:false, errors }
   ▼
Supabase Postgres   +   Resend API → daxis.engg@gmail.com
```
Marketing pages are static/ISR (CDN). Only the action hits server + DB.

## K. Database schema — full runnable SQL (`supabase/migrations/0001_init.sql`)
```sql
create extension if not exists "pgcrypto";

create type enquiry_status as enum ('new','contacted','qualified','closed','spam');
create type enquiry_source as enum ('website','referral','phone','email','other');

create table services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text not null check (phone ~ '^[6-9][0-9]{9}$'),
  company_name text check (company_name is null or char_length(company_name) <= 120),
  service_id uuid references services(id) on delete set null,
  service_label text,
  city text check (city is null or char_length(city) <= 80),
  message text check (message is null or char_length(message) <= 500),
  status enquiry_status not null default 'new',
  source enquiry_source not null default 'website',
  assigned_to uuid,
  ip_address inet,
  user_agent text,
  is_spam boolean not null default false,
  notified boolean not null default false,
  notified_at timestamptz,
  notify_attempts int not null default 0,
  resend_message_id text
);
create index idx_enquiries_created_at on enquiries (created_at desc);
create index idx_enquiries_status on enquiries (status);
create index idx_enquiries_email on enquiries (lower(email));

create table enquiry_events (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references enquiries(id) on delete cascade,
  type text not null,
  detail jsonb,
  actor text,
  created_at timestamptz not null default now()
);
create index idx_events_enquiry on enquiry_events (enquiry_id, created_at desc);

create table email_log (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid references enquiries(id) on delete set null,
  to_address text not null,
  subject text,
  provider text default 'resend',
  status text,
  provider_id text,
  error text,
  created_at timestamptz not null default now()
);

create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;
create trigger trg_enquiries_updated before update on enquiries
  for each row execute function set_updated_at();

alter table services enable row level security;
alter table enquiries enable row level security;
alter table enquiry_events enable row level security;
alter table email_log enable row level security;
create policy "services public read" on services for select to anon using (is_active = true);
-- no anon/authenticated policies on enquiries/enquiry_events/email_log => blocked; service_role bypasses RLS
```

## L. Seed (`supabase/seed.sql`)
```sql
insert into services (slug,name,sort_order) values
 ('engineering-design','Engineering Design & Drafting',1),
 ('geospatial-gis','Geospatial & GIS Mapping',2),
 ('multi-disciplinary','Multi-Disciplinary Engineering',3),
 ('fabrication-shop','Fabrication & Shop Drawings',4),
 ('pmc','Project Management Consultancy (PMC)',5),
 ('manpower-supply','Technical Manpower Supply',6),
 ('other','Other / Not Sure',7)
on conflict (slug) do nothing;
```

## L2. Schema in table form (human-readable — how data is stored & linked)

**Table: `enquiries`** — one row per lead submitted from the website.
| Column | Type | Required | Default | Notes |
|---|---|---|---|---|
| id | uuid | ✅ | gen_random_uuid() | **Primary key** (non-guessable) |
| created_at | timestamptz | ✅ | now() | When submitted |
| updated_at | timestamptz | ✅ | now() | Auto-updated by trigger |
| full_name | text | ✅ | — | 2–120 chars |
| email | text | ✅ | — | Valid email format |
| phone | text | ✅ | — | 10-digit India `[6-9]\d{9}` |
| company_name | text | ❌ | null | ≤120 |
| service_id | uuid | ❌ | null | **FK → services.id** (which service) |
| service_label | text | ❌ | null | Snapshot of service name at submit time |
| city | text | ❌ | null | ≤80 |
| message | text | ❌ | null | ≤500 |
| status | enum | ✅ | 'new' | new / contacted / qualified / closed / spam |
| source | enum | ✅ | 'website' | website / referral / phone / email / other |
| assigned_to | uuid | ❌ | null | Future: admin handling the lead |
| ip_address | inet | ❌ | null | Anti-spam audit |
| user_agent | text | ❌ | null | Anti-spam audit |
| is_spam | boolean | ✅ | false | Flagged by honeypot |
| notified | boolean | ✅ | false | Admin email sent? |
| notified_at | timestamptz | ❌ | null | When email sent |
| notify_attempts | int | ✅ | 0 | Retry counter |
| resend_message_id | text | ❌ | null | Resend's email id |

**Table: `services`** — catalog powering the dropdown (editable without redeploy).
| Column | Type | Required | Default | Notes |
|---|---|---|---|---|
| id | uuid | ✅ | gen_random_uuid() | **Primary key** |
| slug | text | ✅ | — | Unique machine id, e.g. `pmc` |
| name | text | ✅ | — | Display name |
| description | text | ❌ | null | Optional blurb |
| sort_order | int | ✅ | 0 | Dropdown order |
| is_active | boolean | ✅ | true | Hide without deleting |
| created_at | timestamptz | ✅ | now() | — |

**Table: `enquiry_events`** — activity/audit log per lead (future CRM).
| Column | Type | Required | Default | Notes |
|---|---|---|---|---|
| id | uuid | ✅ | gen_random_uuid() | **Primary key** |
| enquiry_id | uuid | ✅ | — | **FK → enquiries.id** (cascade delete) |
| type | text | ✅ | — | created / status_changed / note / email_sent |
| detail | jsonb | ❌ | null | Free-form event payload |
| actor | text | ❌ | null | 'system' or admin email |
| created_at | timestamptz | ✅ | now() | — |

**Table: `email_log`** — record of every notification email (observability).
| Column | Type | Required | Default | Notes |
|---|---|---|---|---|
| id | uuid | ✅ | gen_random_uuid() | **Primary key** |
| enquiry_id | uuid | ❌ | null | **FK → enquiries.id** (set null on delete) |
| to_address | text | ✅ | — | Recipient |
| subject | text | ❌ | null | Email subject |
| provider | text | ❌ | 'resend' | Email provider |
| status | text | ❌ | null | sent / failed |
| provider_id | text | ❌ | null | Provider message id |
| error | text | ❌ | null | Failure reason |
| created_at | timestamptz | ✅ | now() | — |

**Relationships (how data links together)**
| From (child) | Column | To (parent) | Type | On delete | Meaning |
|---|---|---|---|---|---|
| enquiries | service_id | services.id | many-to-one | set null | Each lead optionally picks one service |
| enquiry_events | enquiry_id | enquiries.id | many-to-one | cascade | Each lead has many activity events |
| email_log | enquiry_id | enquiries.id | many-to-one | set null | Each lead has many email records |

```
services (1) ────< (many) enquiries (1) ────< (many) enquiry_events
                                  │
                                  └────< (many) email_log
```
Read as: one **service** can be chosen by many **enquiries**; one **enquiry** generates many **events** and many **email_log** entries.

## M. TypeScript contracts (exact shapes)
```ts
// lib/validation/enquiry.ts
export const enquirySchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile'),
  company_name: z.string().trim().max(120).optional().or(z.literal('')),
  service_id: z.string().uuid().optional().or(z.literal('')),
  city: z.string().trim().max(80).optional().or(z.literal('')),
  message: z.string().trim().max(500).optional().or(z.literal('')),
  website: z.string().max(0).optional(),        // honeypot: must be empty
  turnstileToken: z.string().min(1),
});
export type EnquiryInput = z.infer<typeof enquirySchema>;

// server action return
type SubmitResult =
  | { ok: true }
  | { ok: false; formError?: string; fieldErrors?: Record<string,string> };
```

## N. Module responsibilities & signatures
| File | Responsibility | Key export |
|---|---|---|
| `lib/supabase/server.ts` | Build service_role client (server only) | `createServiceClient(): SupabaseClient` |
| `lib/validation/enquiry.ts` | Shared Zod schema/types | `enquirySchema`, `EnquiryInput` |
| `lib/rate-limit.ts` | Upstash sliding window | `enquiryLimiter.limit(ip)` (5/10min) |
| `lib/turnstile.ts` | CF siteverify call | `verifyTurnstile(token, ip): Promise<boolean>` |
| `lib/email/resend.ts` | Build+send admin email | `sendEnquiryEmail(record): Promise<{id?:string;error?:string}>` |
| `lib/email/template.ts` | HTML body w/ escaping | `enquiryEmailHtml(record): string` |
| `lib/actions/submit-enquiry.ts` | Orchestrate J-flow | `submitEnquiry(prevState, formData): Promise<SubmitResult>` |
| `data/*.ts` | Static content objects | `services`, `projects`, `clients`, `usps`, `consultant` |

## O. External integration details
- **Turnstile verify:** `POST https://challenges.cloudflare.com/turnstile/v0/siteverify` body `{ secret, response: token, remoteip }`; success on `json.success === true`.
- **Resend:** `POST https://api.resend.com/emails` header `Authorization: Bearer RESEND_API_KEY`, body `{ from: EMAIL_FROM, to:[ADMIN_EMAIL], subject, html }`; capture returned `id`.
- **Upstash:** `@upstash/ratelimit` `Ratelimit.slidingWindow(5,'10 m')` backed by `@upstash/redis` from REST env vars.
- **IP source on Vercel:** `x-forwarded-for` (first hop) via `headers()`.

## P. Error handling & edge cases (must-handle)
| Case | Behaviour |
|---|---|
| Rate limit exceeded | Return `{ ok:false, formError:'Too many attempts, try again shortly.' }`, no DB write |
| Honeypot filled | Insert with `is_spam=true`, return `{ ok:true }`, skip email (don't tip off bot) |
| Turnstile fail/expired | `{ ok:false, formError:'Verification failed, please retry.' }` |
| Zod fail | `{ ok:false, fieldErrors }` mapped to inputs |
| DB insert error | `{ ok:false, formError:'Something went wrong. Please call +91-9910461833.' }`; log server-side |
| Email send fail | Lead already saved; `notify_attempts++`, `email_log 'failed'`; still return `{ ok:true }` |
| Duplicate rapid submit | Rate-limit + disabled button guards |
| service_id not found | Treat as null; `service_label=null` |
| Email injection | HTML-escape every interpolated value in template |

## P2. Security hardening (full — required, not optional)

**1. Secrets & key management**
- `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `UPSTASH_*` are **server-only** — never prefixed `NEXT_PUBLIC_`, never imported into a Client Component.
- Verify at build: a lint/CI check that the service-role key string never appears in the client bundle.
- Store secrets only in Vercel Project → Environment Variables (Production/Preview separated) and local `.env.local` (git-ignored). Rotate keys if ever exposed.

**2. Database least-privilege + RLS**
- RLS **enabled on every table**. `enquiries`, `enquiry_events`, `email_log` have **no anon/authenticated policies** → fully blocked to the public; only `service_role` (server) reads/writes.
- `services` exposes **read-only active rows** to anon (safe, public catalog).
- The browser never receives the service-role key, so even a fully compromised frontend cannot read leads.
- Use the **connection pooler** URL for serverless; restrict DB network exposure to Supabase defaults.

**3. Input validation & sanitization (defense in depth — 3 layers)**
- Layer 1 (client): react-hook-form + Zod for UX only (never trusted).
- Layer 2 (server): the **same Zod schema** re-validates in the action — authoritative.
- Layer 3 (database): `CHECK` constraints + typed columns + enums reject anything that slips through.
- All DB access via parameterized `supabase-js` (no string-built SQL) → **SQL injection not possible**.

**4. Anti-bot / anti-spam / abuse**
- **Cloudflare Turnstile** server-side verified on every submit (token single-use, checked with secret + remote IP).
- **Honeypot** hidden field — silent spam capture.
- **Upstash rate-limit** sliding window per IP (5/10 min) → blunts floods & brute submissions.
- Optional: global per-route limit + Vercel WAF/DDoS (platform-level) as backstop.

**5. Email injection prevention**
- Every interpolated value in the email HTML is **HTML-escaped**; subject derived from validated `full_name` only — no newlines/headers from user input → no header/HTML injection.

**6. HTTP security headers (set in `next.config.ts`)**
- `Content-Security-Policy` (allow self + Turnstile + Supabase + Resend domains only; avoid inline scripts / use nonces).
- `Strict-Transport-Security` (HSTS, includeSubDomains, preload).
- `X-Frame-Options: DENY` (+ CSP `frame-ancestors 'none'`) — anti-clickjacking.
- `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (disable camera/mic/geo).

**7. Transport & CSRF**
- HTTPS everywhere (Vercel default, HSTS enforced).
- Next.js **Server Actions** include built-in origin/CSRF protection; keep action invocation same-origin. If the optional `/api/enquiries` REST route is added, add explicit origin checks.

**8. Admin surface (Phase 6) hardening**
- `/admin` behind NextAuth (OAuth — Google/GitHub), gated in `middleware.ts`.
- **Allowlist** specific admin emails (don't allow any Google account); deny by default.
- Admin reads use service-role on the server only; never ship lead data to an unauthenticated client.
- Session cookies: httpOnly, secure, sameSite=lax; short-ish session + rotation.

**9. PII, privacy & data retention (India DPDP Act 2023 aware)**
- Leads contain PII (name/email/phone) → access limited to admin via Supabase login (enable 2FA on Supabase + Resend + Vercel + Cloudflare accounts).
- Add a short **privacy notice** near the form (purpose + contact).
- Define a **retention policy** (e.g. purge `closed`/`spam` after N months via scheduled job) — schema/`status` already supports it.
- IP/user-agent stored strictly for abuse prevention.

**10. Dependency / supply-chain security**
- Pin versions; enable Dependabot/`npm audit` in CI; review transitive deps for the small dependency set.
- Avoid unmaintained packages; lockfile committed.

**11. Logging, monitoring & alerting (no sensitive leakage)**
- Server logs capture errors **without** dumping full PII or secrets.
- `email_log` + `enquiry_events` give an audit trail.
- Alert on spikes in `is_spam`/rate-limit hits; optional Vercel/Sentry monitoring.

**12. Safe error handling**
- User-facing errors are generic ("Something went wrong, call +91-9910461833"); never expose stack traces, SQL, or keys to the browser.

**13. Pre-launch security checklist**
- [ ] Service-role key absent from client bundle (grep build output)
- [ ] RLS verified: anon client cannot select/insert `enquiries`
- [ ] Turnstile + honeypot + rate-limit all block a scripted submit
- [ ] Security headers present (test via securityheaders.com)
- [ ] HTTPS + HSTS active; no mixed content
- [ ] 2FA enabled on all provider accounts
- [ ] Email template escapes a payload like `<script>` / `\nBcc:`
- [ ] Admin allowlist enforced; non-admin OAuth user denied
- [ ] Dependency audit clean
- [ ] Privacy notice live; retention job scheduled

## Q. Frontend / UI specifics
- **Sections (order):** Header(sticky) → Hero → StatsBar → Services(6, grid 1/2/3) → ConsultantProfile → Projects(5) → ClientMarquee(11) → WhyChooseUs(5) → ContactForm → Footer.
- **Libraries:** Tailwind v4, shadcn/ui (Radix), Framer Motion, react-hook-form + `@hookform/resolvers/zod`, react-countup, lucide-react, `@marsidev/react-turnstile`.
- **Fonts (`next/font/google`):** Bebas Neue (hero), Rajdhani (headings), DM Sans (body), Space Mono (badges).
- **Color tokens → `globals.css`:** `--primary #0A1628`, `--accent #FF6B2B`, `--accent-secondary #1E6FA5`, `--surface #0F2040`, `--surface-light #F4F6F9`, `--text-primary #FFF`, `--text-secondary #B0BEC5`, `--success #22C55E`, `--error #EF4444`.
- **Form states:** Default → Loading (spinner, disabled, "Sending…") → Success (green banner, reset) → Error (red banner + phone). Live 500-char counter on message.
- **Animations:** hero fadeInUp 0.6s; staggered card reveals via IntersectionObserver; stats count-up on view; CSS marquee; all gated by `prefers-reduced-motion`.
- **A11y:** semantic landmarks, labeled inputs, focus-visible rings, AA contrast, aria-live on banners.
- **SEO:** `metadata` API, `opengraph-image.tsx`, JSON-LD `Organization`/`LocalBusiness`, `sitemap.ts`, `robots.ts`, manifest/favicon.

## R. Project structure & dependencies
```
app/ layout.tsx page.tsx api/enquiries/route.ts(optional) admin/page.tsx(Phase6)
     sitemap.ts robots.ts opengraph-image.tsx
components/daxis/ Header StatsBar Hero ServiceCard ConsultantProfile
                 ProjectCard ClientMarquee USPCard ContactForm Toast
lib/ supabase/server.ts validation/enquiry.ts rate-limit.ts turnstile.ts
     email/{resend,template}.ts actions/submit-enquiry.ts
data/ services.ts projects.ts clients.ts usps.ts consultant.ts
supabase/ migrations/0001_init.sql seed.sql
```
Deps: `next@^15 react@^19 react-dom@^19 @supabase/supabase-js resend zod react-hook-form @hookform/resolvers framer-motion react-countup lucide-react @marsidev/react-turnstile @upstash/ratelimit @upstash/redis`; dev: `typescript @types/* tailwindcss@^4 @tailwindcss/postcss`; shadcn via `npx shadcn@latest init`.

## S. Environment variables (`.env.example`) — with where to get each
```
NEXT_PUBLIC_SUPABASE_URL=          # Supabase → Project Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # same page (only if client read added)
SUPABASE_SERVICE_ROLE_KEY=         # same page — SERVER ONLY, never NEXT_PUBLIC
SUPABASE_DB_POOLER_URL=            # Settings → Database → Connection Pooling (optional)
RESEND_API_KEY=                    # resend.com → API Keys
ADMIN_EMAIL=daxis.engg@gmail.com
EMAIL_FROM="DAxis Website <onboarding@resend.dev>"
NEXT_PUBLIC_TURNSTILE_SITE_KEY=    # Cloudflare → Turnstile → site
TURNSTILE_SECRET_KEY=              # Cloudflare → Turnstile → site (secret)
UPSTASH_REDIS_REST_URL=            # console.upstash.com → Redis → REST
UPSTASH_REDIS_REST_TOKEN=
```

## T. Build phases, testing, deployment
**Phases:** 0 Foundations(0.5d) → 1 DB(0.5d) → 2 Backend(1–1.5d) → 3 Marketing site(2–3d) → 4 Contact form(1d) → 5 SEO/a11y/polish(0.5–1d) → 6 Admin(optional 1–2d) → 7 Deploy(0.5d). **~7–10d to launch.**

**Testing:**
- Unit: Zod per-field valid/invalid; email HTML escaping.
- Integration: action happy path (row+email), honeypot, Turnstile fail, rate-limit trip, email-fail-still-saves.
- E2E (Playwright): fill → success → row in Supabase → email received.
- Manual: responsive 375/768/1280, keyboard nav, reduced-motion, Lighthouse ≥90.

**Deployment runbook:**
1. Supabase: run migration + seed; copy URL/keys.
2. Resend: API key (later verify domain + DNS).
3. Turnstile: site key + secret.
4. Upstash: REST URL + token.
5. Vercel: import repo, add env (§S), deploy.
6. Custom domain → Vercel; switch `EMAIL_FROM` to verified domain.
7. Smoke test: submit enquiry → confirm DB row + admin email.

## U. Future roadmap
Admin CRM (status/notes/assignment) · email retry worker (Vercel Cron/Edge Function draining `notified=false`) · auto-reply to enquirer · WhatsApp/SMS alert · analytics · file upload (Supabase Storage) for RFQ drawings · multi-select services · i18n.

---

## Acceptance Criteria Mapping (PRD §10)
| PRD criterion | Covered by |
|---|---|
| 7-field insert into Supabase | §K schema + Phase 4 form/action |
| Client-side required validation | §M Zod + react-hook-form |
| Email alert on submission | §O Resend (Phase 2) |
| Success/error states | Phase 4 + Toast |
| 6 services displayed | §L seed, data-driven |
| Responsive ≥375px | §Q / Phase 3 |
| service_role server-only / anon safe | §P2 security |
| Sticky header + smooth scroll | Phase 3 layout |
| Hero/stats/marquee/hover/loading anims | Phase 3/4 Framer Motion |
| SEO meta tags | Phase 5 |

## Loose ends / notes
- Client content (PART I §C) required before Phase 3.
- Launch on `onboarding@resend.dev`; switch to verified domain when DNS ready.
- This document is portable — copy `docs/` into the new DAxis repository as the build blueprint.

---

*End of plan — DAxis Engineering Consultancy. Stack: Next.js 15 full-stack · Supabase · Resend. Secure by design, scalable by default.*
