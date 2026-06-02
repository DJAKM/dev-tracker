# DAxis Engineering Consultancy — Website Implementation Plan

This document is the complete planning reference for the DAxis Engineering
Consultancy website. It is written for two audiences:

- **Part I — Client Track:** plain-language overview for DAxis / Sunil Sharma.
- **Part II — Backend-Developer Track:** exhaustive technical detail for the
  developer who will build the site.

The site will be built with **Next.js 15** (App Router, TypeScript) as a
full-stack application, hosted on **Vercel + Supabase**, and lives in its own
standalone repository (this document is portable into that new repo).

---

## PART I — CLIENT TRACK (non-technical, for DAxis / Sunil Sharma)

### A. What you are getting (in plain language)
- A professional one-page website (with smooth-scrolling sections) for DAxis Engineering Consultancy.
- Sections: top menu bar, hero banner, key stats, 6 services, your consultant profile, 5 featured projects, scrolling client names, "why choose us", an enquiry form, and a footer.
- A working **enquiry form**: when a visitor submits it, the lead is **saved in a database** and an **email alert** lands in `daxis.engg@gmail.com` instantly.
- Works perfectly on **mobile, tablet, and desktop**.

### B. How the enquiry flow works (your day-to-day)
1. A visitor fills the form (name, email, phone, + optional company, service, city, message).
2. You receive an email at `daxis.engg@gmail.com` titled "New Enquiry from [Name] — DAxis Website".
3. Every lead is also stored permanently; you view/search them in the **Supabase dashboard** (a simple web table login).
4. Each lead has a status you can change: New → Contacted → Qualified → Closed.

### C. What we need from YOU before we start (content checklist)
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

### D. Accounts you'll need (all free, we set them up with you)
| Account | Purpose | Cost |
|---|---|---|
| Supabase | Stores all enquiries (the database) | Free |
| Resend | Sends the email alerts | Free (3,000 emails/month) |
| Cloudflare | Blocks spam bots on the form | Free |
| Vercel | Hosts the website | Free |
| Upstash | Prevents form abuse/flooding | Free |
| Domain (optional) | e.g. `daxisengg.com` for a branded URL + branded email sender | ~₹800–1,200/yr (optional) |

### E. Cost summary
- **₹0/month** on free tiers — sufficient for years of normal traffic.
- Only optional cost is a custom domain name (one-time yearly), recommended for credibility and branded emails.

### F. Timeline (estimate)
- **~7–10 working days** to a live public site (once content is provided).
- +1–2 days if you want the optional in-house admin dashboard (otherwise you use Supabase's built-in table view).

### G. What happens after launch (maintenance)
- The site runs itself; no servers to manage.
- To edit services or text later, the developer makes a quick change (content is kept in simple files).
- You'll get a short "how to read your leads" guide for the Supabase dashboard.

### H. Privacy & data note
- Enquiry data (name, email, phone, message) is stored securely; only DAxis (via the admin login) can read it.
- We capture basic technical info (IP/browser) only to stop spam.
- Recommended: add a one-line privacy note near the form.

---

## PART II — BACKEND-DEVELOPER TRACK (exhaustive technical detail)

### I. Locked decisions
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
| D12 | UI library | **shadcn/ui** (Radix + Tailwind, components owned in-repo). Themes via CSS variables → PRD palette maps in with **no breaking changes** and is **easily customizable** for future changes. MUI rejected (opinionated Material look, Emotion theming, no Tailwind, heavier to rebrand). |
| D13 | Content model | **All page content is dynamic, served from an API (Supabase-backed).** No hardcoded `data/*.ts`. Every section (hero, stats, services, profile, projects, clients, USPs, contact info) is rendered from API responses so DAxis can edit content without a redeploy. |
| D14 | Loading UX | **Splash screen** on initial app load + **per-section skeleton loaders** (shaped placeholders, not spinners) while each section's data is fetched. All gated by `prefers-reduced-motion`. |
| D15 | Design source | **Figma Make** (`figma.com/make/C4cmIrNU1MBghzFX9DxScQ/DAxis-Engineering`) is the source of truth for sections, content fields, and visual design. Exact content schema (§V) is finalized against the Figma export. |

### J. Architecture & request lifecycle

**J1. Content read flow (dynamic page render — every section)**
```
Browser loads app → Splash screen (brand) shown while bootstrapping
   ▼
Page render: each section requests its content from the content API
   GET /api/content/{section}  (or one batched GET /api/content)
   ▼
Next.js Server (Vercel function / Route Handler or RSC fetch)
   1 Read from Supabase content tables (anon read, RLS: active rows only)
   2 Shape into typed JSON contract (§V)
   3 Cache: ISR/`revalidate` + CDN; stale-while-revalidate for instant repeat loads
   ▼
While a section's data is in-flight → render its SKELETON loader
On resolve → swap skeleton for real content (Framer Motion fade)
On error → friendly empty/error state + retry
```
Rendering strategy: content is fetched server-side (RSC) with ISR so the
HTML ships pre-populated and SEO-safe; client components hydrate and use
skeletons only for client-fetched/refetched data. The **splash screen**
covers the very first paint; **skeletons** cover per-section data latency.

**J2. Enquiry write flow (form submission)**
```
Browser (Client Component form + Turnstile widget)
   │ Server Action invocation (multipart/form fields)
   ▼
Next.js Server (Vercel function)
   1 Upstash rate-limit (key = ip)         → 429-style friendly error if exceeded
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
Content is dynamic but cacheable (ISR/CDN). Only the write action and
uncached content reads hit server+DB.

### K. Database schema — full runnable SQL (`supabase/migrations/0001_init.sql`)
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

### K2. Dynamic content schema — full SQL (`supabase/migrations/0002_content.sql`)
> All page content is dynamic and served from these tables via the content API (§V).
> Public read is anon + RLS-limited to active rows; only admin/service_role writes.
> Final column set is reconciled against the Figma export (D15) before build.
```sql
-- 1) Singleton/section content as flexible JSON (hero, stats labels, about/profile,
--    why-choose-us heading, contact info, SEO, splash config). One row per section key.
create table site_content (
  key text primary key,              -- e.g. 'hero','stats','consultant','why_choose_us','contact','seo','splash'
  data jsonb not null,               -- shape defined per-section in §V
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

-- 2) Repeating collections (ordered lists rendered as cards/marquee items)
create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  client text,
  description text,
  year int,
  image_url text,
  tags text[],
  sort_order int not null default 0,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  website_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table usps (                  -- "Why choose us" points
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  icon text,                         -- lucide icon name
  sort_order int not null default 0,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);
-- NOTE: `services` (in 0001) already powers both the Services section and the
-- contact-form dropdown — extend it with display fields used by the section:
alter table services add column if not exists icon text;
alter table services add column if not exists image_url text;
alter table services add column if not exists short_tagline text;

-- reuse the updated_at trigger from 0001 on each content table
create trigger trg_site_content_updated before update on site_content for each row execute function set_updated_at();
create trigger trg_projects_updated     before update on projects     for each row execute function set_updated_at();
create trigger trg_clients_updated       before update on clients      for each row execute function set_updated_at();
create trigger trg_usps_updated          before update on usps         for each row execute function set_updated_at();

-- RLS: public can read published/active content; writes are service_role/admin only
alter table site_content enable row level security;
alter table projects     enable row level security;
alter table clients       enable row level security;
alter table usps          enable row level security;
create policy "site_content public read" on site_content for select to anon using (is_published = true);
create policy "projects public read"     on projects     for select to anon using (is_active = true);
create policy "clients public read"       on clients      for select to anon using (is_active = true);
create policy "usps public read"          on usps         for select to anon using (is_active = true);
```

### L. Seed (`supabase/seed.sql`)
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

### L2. Schema in table form (human-readable)

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

### M. TypeScript contracts (exact shapes)
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

### N. Module responsibilities & signatures
| File | Responsibility | Key export |
|---|---|---|
| `lib/supabase/server.ts` | Build service_role client (server only) | `createServiceClient(): SupabaseClient` |
| `lib/validation/enquiry.ts` | Shared Zod schema/types | `enquirySchema`, `EnquiryInput` |
| `lib/rate-limit.ts` | Upstash sliding window | `enquiryLimiter.limit(ip)` (5/10min) |
| `lib/turnstile.ts` | CF siteverify call | `verifyTurnstile(token, ip): Promise<boolean>` |
| `lib/email/resend.ts` | Build+send admin email | `sendEnquiryEmail(record): Promise<{id?:string;error?:string}>` |
| `lib/email/template.ts` | HTML body w/ escaping | `enquiryEmailHtml(record): string` |
| `lib/actions/submit-enquiry.ts` | Orchestrate J2-flow | `submitEnquiry(prevState, formData): Promise<SubmitResult>` |
| `lib/content/queries.ts` | Typed content reads from Supabase (anon client) | `getSiteContent(key)`, `getProjects()`, `getClients()`, `getUsps()`, `getServices()` |
| `lib/content/schema.ts` | Zod schemas validating each section's JSON shape (§V) | `heroSchema`, `statsSchema`, `consultantSchema`, … |
| `app/api/content/[section]/route.ts` | Public content API (cached, ISR) | `GET` → typed JSON per section |
| `components/skeletons/*` | Per-section skeleton loaders | `HeroSkeleton`, `ServicesSkeleton`, `ProjectsSkeleton`, … |
| `components/SplashScreen.tsx` | Brand splash on initial load | `<SplashScreen />` |
| ~~`data/*.ts`~~ | **Removed** — content is dynamic from the API/DB, not static files | — |

### O. External integration details
- **Turnstile verify:** `POST https://challenges.cloudflare.com/turnstile/v0/siteverify` body `{ secret, response: token, remoteip }`; success on `json.success === true`.
- **Resend:** `POST https://api.resend.com/emails` header `Authorization: Bearer RESEND_API_KEY`, body `{ from: EMAIL_FROM, to:[ADMIN_EMAIL], subject, html }`; capture returned `id`.
- **Upstash:** `@upstash/ratelimit` `Ratelimit.slidingWindow(5,'10 m')` backed by `@upstash/redis` from REST env vars.
- **IP source on Vercel:** `x-forwarded-for` (first hop) via `headers()`.

### P. Error handling & edge cases (must-handle)
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

### P2. Security hardening (full — required, not optional)

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
- `Content-Security-Policy` (allow self + Turnstile + Supabase + Resend domains only; no inline scripts where avoidable / use nonces).
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
- [ ] Email template escapes a payload like `<script>`/`\nBcc:`
- [ ] Admin allowlist enforced; non-admin OAuth user denied
- [ ] Dependency audit clean
- [ ] Privacy notice live; retention job scheduled

### Q0. UI component library & theming (shadcn/ui — fits PRD colors, no breaking changes)
- **Why shadcn/ui:** unstyled Radix primitives themed entirely via CSS variables → the PRD palette becomes the theme and **every** component (button, input, select, dialog, toast, badge) inherits it. No override war with a built-in design language; easy to rebrand later by editing a few variables. Component source lives in-repo (`components/ui/*`), so it's owned and future-flexible — not a node_modules black box.
- **Why not MUI:** ships an opinionated Material look themed via Emotion/MUI System (not Tailwind). Hitting the dark industrial/blueprint aesthetic means heavy theme overrides, a heavier bundle, and higher risk of fighting the brand look.
- **Map PRD tokens → shadcn theme variables** in `globals.css` (HSL is shadcn convention; exact hues finalized to match hex at build):
  ```css
  :root {
    --background: 210 60% 10%;       /* #0A1628 primary navy   */
    --foreground: 0 0% 100%;         /* #FFFFFF text-primary   */
    --card: 213 62% 15%;             /* #0F2040 surface        */
    --primary: 18 100% 58%;          /* #FF6B2B accent orange  */
    --primary-foreground: 0 0% 100%;
    --secondary: 202 69% 38%;        /* #1E6FA5 steel blue     */
    --muted-foreground: 205 19% 73%; /* #B0BEC5 text-secondary */
    --destructive: 0 84% 60%;        /* #EF4444 error          */
    --ring: 18 100% 58%;             /* focus ring = accent    */
    --radius: 0.5rem;
    /* brand extras: --success 142 71% 45% (#22C55E); --surface-light #F4F6F9 */
  }
  ```
- **Reusability:** shared primitives in `components/ui/`; DAxis compositions in `components/daxis/` consume them (DRY, consistent, swappable).
- **Install:** `npx shadcn@latest init`; add only what's used: `button input textarea select label dialog sonner badge`. Pairs natively with Tailwind v4 + Framer Motion.

### Q. Frontend/UI specifics
- **All sections are data-driven** (D13) — every section fetches its content from the content API (§V) and shows a **skeleton** until data resolves.
- **Splash + skeletons (D14):** initial load shows a brand **SplashScreen** (logo on `--primary` navy, dismissed on first paint/hydration or min 600–900ms, whichever later, then fades out); each section renders its own **skeleton loader** while its data is in flight. See §W for the full spec.
- **Sections (order):** Header(sticky) → Hero → StatsBar → Services(grid 1/2/3) → ConsultantProfile → Projects → ClientMarquee → WhyChooseUs → ContactForm → Footer. (Counts like "6 services / 5 projects / 11 clients" are now driven by the API data, not fixed.)
- **Libraries:** Tailwind v4, **shadcn/ui (Radix — chosen UI library, see Q0; `Skeleton` component included)**, Framer Motion, react-hook-form + `@hookform/resolvers/zod`, react-countup, lucide-react, `@marsidev/react-turnstile`.
- **Fonts (`next/font/google`):** Bebas Neue (hero), Rajdhani (headings), DM Sans (body), Space Mono (badges).
- **Color tokens → `globals.css`:** `--primary #0A1628`, `--accent #FF6B2B`, `--accent-secondary #1E6FA5`, `--surface #0F2040`, `--surface-light #F4F6F9`, `--text-primary #FFF`, `--text-secondary #B0BEC5`, `--success #22C55E`, `--error #EF4444`.
- **Form states:** Default → Loading (spinner, disabled, "Sending…") → Success (green banner, reset) → Error (red banner + phone). Live 500-char counter on message.
- **Animations:** hero fadeInUp 0.6s; staggered card reveals via IntersectionObserver; stats count-up on view; CSS marquee; all gated by `prefers-reduced-motion`.
- **A11y:** semantic landmarks, labeled inputs, focus-visible rings, AA contrast, aria-live on banners.
- **SEO:** `metadata` API, `opengraph-image.tsx`, JSON-LD `Organization`/`LocalBusiness`, `sitemap.ts`, `robots.ts`, manifest/favicon.

### R. Project structure & dependencies
```
app/ layout.tsx page.tsx admin/page.tsx(Phase6)
     api/enquiries/route.ts(optional)
     api/content/[section]/route.ts        # public dynamic content API (§V)
     sitemap.ts robots.ts opengraph-image.tsx
components/ui/ (shadcn primitives: button input textarea select label dialog sonner badge skeleton)
components/SplashScreen.tsx                  # initial brand splash (D14)
components/daxis/ Header StatsBar Hero ServiceCard ConsultantProfile
                 ProjectCard ClientMarquee USPCard ContactForm Toast
components/skeletons/ HeroSkeleton StatsSkeleton ServicesSkeleton
                 ConsultantSkeleton ProjectsSkeleton ClientsSkeleton UspsSkeleton
lib/ supabase/server.ts supabase/anon.ts validation/enquiry.ts rate-limit.ts turnstile.ts
     email/{resend,template}.ts actions/submit-enquiry.ts
     content/queries.ts content/schema.ts      # dynamic content reads + Zod shapes (§V)
supabase/ migrations/0001_init.sql migrations/0002_content.sql seed.sql
```
> No `data/*.ts` — content lives in Supabase content tables (§K2) and is served via the content API (§V).

Deps: `next@^15 react@^19 react-dom@^19 @supabase/supabase-js resend zod react-hook-form @hookform/resolvers framer-motion react-countup lucide-react @marsidev/react-turnstile @upstash/ratelimit @upstash/redis`; dev: `typescript @types/* tailwindcss@^4 @tailwindcss/postcss`; shadcn via `npx shadcn@latest init`.

### S. Environment variables (`.env.example`) — with where to get each
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

### V. Dynamic content API & contracts (D13)
All page content is served from the content API and validated with Zod (`lib/content/schema.ts`) on read so a bad/edited DB row can never crash the page.

**Endpoints** (cached with ISR + `revalidate`, CDN-fronted; anon read only):
| Route | Returns | Source |
|---|---|---|
| `GET /api/content/hero` | `{ headline, subline, primaryCta, secondaryCta, bgImageUrl? }` | `site_content` key `hero` |
| `GET /api/content/stats` | `[{ label, value, suffix? }]` | `site_content` key `stats` |
| `GET /api/content/services` | `[{ id, slug, name, short_tagline, description, icon, image_url }]` | `services` (active, ordered) |
| `GET /api/content/consultant` | `{ name, title, bio, photoUrl, software: string[] }` | `site_content` key `consultant` |
| `GET /api/content/projects` | `[{ id, title, client, description, year, image_url, tags }]` | `projects` (active, ordered) |
| `GET /api/content/clients` | `[{ id, name, logo_url, website_url }]` | `clients` (active, ordered) |
| `GET /api/content/why-choose-us` | `{ heading, items:[{ title, description, icon }] }` | `site_content` `why_choose_us` + `usps` |
| `GET /api/content/contact` | `{ phone, email, address, mapUrl?, hours? }` | `site_content` key `contact` |
| `GET /api/content/seo` | `{ title, description, ogImageUrl, jsonLd }` | `site_content` key `seo` |
| `GET /api/content/splash` | `{ enabled, minMs, logoUrl, tagline? }` | `site_content` key `splash` |
| `GET /api/content` | Batched object of all of the above (single round-trip option) | all |

- **Caching:** `export const revalidate = 300` (5 min) per route + `Cache-Control: s-maxage, stale-while-revalidate` so repeat loads are instant and content edits propagate within the window. Admin edits can trigger on-demand `revalidatePath`/`revalidateTag` for instant refresh.
- **Read path:** server components call `lib/content/queries.ts` directly (RSC, no HTTP hop) so first HTML is pre-populated & SEO-safe; the `/api/content/*` routes exist for client-side refetch and external use.
- **Validation/fallbacks:** each response parsed by its Zod schema; on parse failure the section renders a safe empty/error state, logs server-side, and never throws to the client.
- **Exact field names** are reconciled against the Figma export (D15) before Phase 2 — the shapes above are the working contract.

### W. Loading experience — splash screen & skeletons (D14)
- **SplashScreen (`components/SplashScreen.tsx`):**
  - Full-screen brand overlay on `--primary` navy with the DAxis logo + subtle motion (logo fade/scale, optional blueprint-grid shimmer).
  - Config from `GET /api/content/splash` (`enabled`, `minMs`, `logoUrl`); default `minMs` 600–900ms.
  - Dismiss = `max(appHydrated, minMs)` then Framer Motion fade-out; mounted in `app/layout.tsx` so it covers first paint.
  - `prefers-reduced-motion`: static logo, no animation, shorter hold.
  - A11y: `role="status"`, `aria-busy`, focus not trapped; removed from DOM after exit.
- **Per-section skeletons (`components/skeletons/*`, built on shadcn `Skeleton`):**
  - Each section shows a shaped placeholder matching its real layout (e.g. Services = grid of card skeletons; ClientMarquee = row of logo bars; Hero = headline + button bars; Stats = number blocks).
  - Server-rendered sections use Next.js `loading.tsx` / React `<Suspense fallback={<XSkeleton/>}>`; client-refetched sections toggle skeleton on `isLoading`.
  - Skeletons use a `prefers-reduced-motion`-aware shimmer (static when reduced).
  - **Error/empty states:** if a section's fetch fails or returns empty, show a minimal friendly message (not a broken layout) with optional retry; never block the rest of the page.
- **Acceptance:** no layout shift between skeleton → content (reserve dimensions); splash never blocks > its min + first paint; all loading animations honor reduced-motion.

### T. Build phases, testing, deployment
**Phases:** 0 Foundations(0.5d) → 1 DB incl. content tables(0.75d) → 2 Backend + content API/queries(1.5–2d) → 3 Dynamic marketing site w/ splash + skeletons(2.5–3.5d) → 4 Contact form(1d) → 5 SEO/a11y/polish(0.5–1d) → 6 Admin content editor + leads(optional 2–3d) → 7 Deploy(0.5d). **~8–11d to launch.**

**Testing:**
- Unit: Zod per-field valid/invalid; email HTML escaping; **content section schemas (valid/malformed DB row → safe fallback)**.
- Integration: action happy path (row+email), honeypot, Turnstile fail, rate-limit trip, email-fail-still-saves; **content API returns shaped JSON, cache headers present, empty table → empty state**.
- E2E (Playwright): fill→success→row in Supabase→email received; **splash shows then dismisses; each section shows skeleton then real content; section fetch error → friendly state without breaking page**.
- Manual: responsive 375/768/1280, keyboard nav, reduced-motion (splash + skeletons static), no layout shift skeleton→content, Lighthouse ≥90.

**Deployment runbook:**
1. Supabase: run migration+seed; copy URL/keys. 2. Resend: API key (later verify domain+DNS). 3. Turnstile: site key+secret. 4. Upstash: REST URL+token. 5. Vercel: import repo, add env (§S), deploy. 6. Custom domain → Vercel; switch `EMAIL_FROM` to verified domain. 7. Smoke test: submit enquiry → confirm DB row + admin email.

### U. Future roadmap
Admin **content editor UI** (edit hero/stats/services/projects/clients/USPs/contact + reorder + publish toggles, with on-demand revalidation) · Admin CRM (status/notes/assignment) · email retry worker (Vercel Cron/Edge Function draining `notified=false`) · auto-reply to enquirer · WhatsApp/SMS alert · analytics · file/image upload (Supabase Storage) for projects/clients/RFQ drawings · multi-select services · i18n.

---

## Notes / loose ends
- GitHub access in the current session is scoped to `djakm/dev-tracker`; the new DAxis repo must be scaffolded from a session pointed at it.
- **All content is dynamic** (D13) via the content API (§V); **splash + skeletons** (D14, §W) cover loading. No static content files.
- **Figma Make link (D15)** is the design/content source of truth. The Figma Make URL is a JS/auth-gated app and can't be fetched/scraped server-side — the **exact content fields + section list must be exported or pasted** to finalize §K2/§V before Phase 2.
- Launch on `onboarding@resend.dev`; switch to a verified domain when DNS is ready.
