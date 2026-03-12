# BlueStay — Project Status Tracker

> **Last Updated:** 2026-03-12  
> **Codebase:** ~53,000+ lines across API (NestJS), Web (Next.js), shared packages, infra  
> **Overall Completion:** ~97%

---

## Table of Contents

1. [Codebase Stats](#codebase-stats)
2. [Backend (API) — Feature Checklist](#backend-api--feature-checklist)
3. [Frontend (Web) — Page Checklist](#frontend-web--page-checklist)
4. [Infrastructure & DevOps](#infrastructure--devops)
5. [Testing](#testing)
6. [Remaining Work — Prioritized](#remaining-work--prioritized)
7. [Feature Implementation Plans](#feature-implementation-plans)

---

## Codebase Stats

| Metric | Count |
|--------|-------|
| Total Lines of Code | ~53,000 |
| API Source (NestJS) | ~15,500 lines |
| Web Source (Next.js) | ~30,000 lines |
| Prisma Models | 18 |
| Prisma Enums | 16 |
| GraphQL Schema | 1,700+ lines |
| API Modules | 17 |
| API Services | 22 |
| Web Pages | 46 |
| React Components | 40+ |
| Unit Test Suites | 4 (auth, booking, admin, notification) |
| E2E Test Specs | 4 (health, auth, booking-flow, homepage) |
| Load Test Scripts | 2 (k6 booking-flow, k6 stress-test) |

---

## Backend (API) — Feature Checklist

### Authentication & Authorization

| Feature | Status | Notes |
|---------|--------|-------|
| JWT Login (email + password) | ✅ Done | Access + refresh tokens with rotation |
| JWT Refresh Token | ✅ Done | Secure rotation, bcrypt-hashed |
| OTP Login (phone) | ✅ Done | Redis-backed codes, SMS delivery via MSG91 |
| Google OAuth | ✅ Done | Token verification via google-auth-library |
| Role-Based Access (RBAC) | ✅ Done | Guest, HotelStaff, HotelAdmin, PlatformAdmin |
| Tenant Isolation Guard | ✅ Done | Hotel admins restricted to own hotel |
| Change Password | ✅ Done | Authenticated users only |
| Password Reset (Forgot Password) | ✅ Done | `requestPasswordReset` + `resetPassword` mutations, Redis token, email template |
| Email Verification | ✅ Done | Token-based verify on register, `verifyEmail` + `resendVerificationEmail` mutations |
| Phone Verification | ❌ Missing | Schema field exists (`phoneVerified`), no flow |
| Account Lockout (brute force) | ✅ Done | Redis-based: 5 failed attempts → 15 min lockout |

### Booking Engine

| Feature | Status | Notes |
|---------|--------|-------|
| Daily Bookings (check-in/out) | ✅ Done | Full flow with date validation |
| Hourly Bookings (day-use) | ✅ Done | Configurable min/max hours |
| Real-time Availability | ✅ Done | Redis distributed locks prevent double-booking |
| Inventory Management | ✅ Done | Per room-type per-date with overrides |
| Booking Cancellation | ✅ Done | Status update + email notification |
| Booking Modification | ✅ Done | Date/room/guest changes + price recalculation |
| Walk-in Booking | ✅ Done | Uses standard mutation with `WALK_IN` source |
| Auto-Cancel Unpaid | ✅ Done | Cancels after 30 min, releases RoomInventory + HourlySlot in transaction |
| Invoice PDF Generation | ✅ Done | PDFKit with hotel branding, GST breakdown |
| Booking Number Generation | ✅ Done | Unique sequential numbers |

### Payment Processing

| Feature | Status | Notes |
|---------|--------|-------|
| Razorpay Integration | ✅ Done | Orders, capture, refunds |
| Demo Gateway (dev) | ✅ Done | Auto-approves for testing |
| Webhook Verification | ✅ Done | HMAC SHA256 signature check |
| Commission Auto-Calculation | ✅ Done | Per booking based on hotel rate |
| Refund Processing | ✅ Done | Full + partial refunds |
| Stripe Integration | ✅ Done | `StripeGateway` class using Checkout Sessions, auto-selected via `STRIPE_SECRET_KEY` env |

### Hotel Management

| Feature | Status | Notes |
|---------|--------|-------|
| Hotel CRUD | ✅ Done | Create, update, activate, suspend |
| Room Type CRUD | ✅ Done | Full management with images, amenities |
| Bulk Inventory Update | ✅ Done | Date range upsert (up to 365 days) |
| Smart Pricing Engine | ✅ Done | Occupancy-based suggestions with reasons |
| Hotel Search + Filters | ✅ Done | City, state, price, rating, amenities |
| Popular Cities | ✅ Done | Aggregated hotel counts |
| Featured Hotels | ✅ Done | Curated listing |
| Hotel Onboarding (Self-Service) | ✅ Done | Multi-step form, admin approval |
| Multi-Hotel Admin | ❌ Missing | 1 admin = 1 hotel, no hotel switching |

### Content & SEO

| Feature | Status | Notes |
|---------|--------|-------|
| Blog CRUD | ✅ Done | Draft → Publish → Archive lifecycle |
| SEO Meta CRUD | ✅ Done | Title, description, OG image, JSON-LD |
| Dynamic Sitemap | ✅ Done | Server-generated with hotel slugs |
| Robots.txt | ✅ Done | Disallows admin/auth paths |
| OpenGraph + Twitter Cards | ✅ Done | Dynamic metadata on hotel pages |

### Reviews & Ratings

| Feature | Status | Notes |
|---------|--------|-------|
| Guest Review Submission | ✅ Done | Star rating + text |
| Hotel Admin Reply | ✅ Done | Reply to reviews |
| Review Moderation | ✅ Done | `approveReview` + `rejectReview` mutations |
| Review Prompts | ✅ Done | Email sent post-checkout via queue |

### Commission & Settlement

| Feature | Status | Notes |
|---------|--------|-------|
| Commission Tracking | ✅ Done | Auto-created per booking |
| Single Settlement | ✅ Done | Platform admin marks as settled |
| Bulk Settlement | ✅ Done | Batch process multiple commissions |
| Disputes | ✅ Done | Hotel can dispute, platform can resolve |

### Notifications

| Feature | Status | Notes |
|---------|--------|-------|
| Email (SMTP/Nodemailer) | ✅ Done | HTML templates for all events |
| SMS (MSG91) | ✅ Done | OTP + booking notifications |
| WhatsApp (MSG91) | ✅ Done | Booking confirmations |
| Web Push (VAPID) | ✅ Done | Subscription management + push |
| In-app Notifications | ✅ Done | `Notification` model, `InboxService` + `InboxResolver`, `myNotifications` query, mark-read mutations |

### User Management

| Feature | Status | Notes |
|---------|--------|-------|
| Profile Update | ✅ Done | Name, email, phone, avatar |
| Booking History | ✅ Done | Per guest with filters |
| Account Deactivation | ✅ Done | Soft-delete (sets `isActive: false`) |
| Account Hard Delete (GDPR) | ✅ Done | `deleteMyAccount` mutation — anonymizes PII, redacts bookings/reviews, revokes tokens |

### File Upload & Storage

| Feature | Status | Notes |
|---------|--------|-------|
| Local File Storage | ✅ Done | `uploads/` directory with categories |
| S3/R2 Cloud Storage | ✅ Done | AWS S3 + Cloudflare R2 support |
| Gallery Upload + Reorder | ✅ Done | Multi-file, drag-and-drop sort |
| MIME Validation | ✅ Done | JPEG, PNG, WebP, GIF only |

### Analytics

| Feature | Status | Notes |
|---------|--------|-------|
| Revenue Analytics | ✅ Done | Current vs previous period, growth % |
| Occupancy Analytics | ✅ Done | By room type, daily breakdown |
| Booking Analytics | ✅ Done | Status/source/type breakdown, top rooms |
| Guest Analytics | ✅ Done | New vs returning, top spenders |
| Platform-Wide Analytics | ✅ Done | Top hotels, daily revenue trends |

### Infrastructure Services

| Feature | Status | Notes |
|---------|--------|-------|
| Redis Caching | ✅ Done | `cacheOrFetch` pattern with TTL |
| Redis Distributed Locks | ✅ Done | Prevent double-booking |
| BullMQ Job Queue | ✅ Done | Email, booking-jobs, analytics queues |
| Scheduled Tasks (Cron) | ✅ Done | Hourly cleanup, reminders |
| Audit Log Interceptor | ✅ Done | Logs to console + persists to `AuditLog` DB table (indexed by user, hotel, operation, time) |
| Rate Limiting | ✅ Done | 3-tier throttling (10/s, 50/10s, 200/min) |
| CORS | ✅ Done | Async origin callback queries Redis→DB for custom hotel domains, regex for `*.bluestay.in` |
| Helmet Security Headers | ✅ Done | CSP, HSTS via Nginx |
| Security Sanitization | ✅ Done | XSS prevention: color/font/URL/text/JSON-LD/template-name validators |
| Permissions-Policy Header | ✅ Done | camera=(), microphone=(), geolocation=(self), payment=(self) |

---

## Frontend (Web) — Page Checklist

### Public Pages

| Page | Route | Status |
|------|-------|--------|
| Homepage | `/` | ✅ Done |
| Hotel Listing | `/hotels` | ✅ Done |
| Hotel Detail | `/hotels/[slug]` | ✅ Done |
| City Filtered Hotels | `/hotels/city/[city]` | ✅ Done |
| Blog Listing | `/blog` | ✅ Done |
| Blog Post | `/blog/[slug]` | ✅ Done |
| Hotel Onboarding | `/onboard` | ✅ Done |
| Offline Fallback | `/offline` | ✅ Done |

### Auth Pages

| Page | Route | Status |
|------|-------|--------|
| Login | `/auth/login` | ✅ Done |
| Register | `/auth/register` | ✅ Done |
| Forgot Password | `/auth/forgot-password` | ✅ Done |
| Reset Password | `/auth/reset-password` | ✅ Done |
| Verify Email | `/auth/verify-email` | ✅ Done |

### Hotel Tenant Pages (White-Label)

| Page | Route | Status |
|------|-------|--------|
| Hotel Home | `/hotel` | ✅ Done |
| Rooms Listing | `/hotel/rooms` | ✅ Done |
| Room Detail | `/hotel/rooms/[id]` | ✅ Done |
| About | `/hotel/about` | ✅ Done |
| Contact | `/hotel/contact` | ✅ Done |
| Gallery | `/hotel/gallery` | ✅ Done |
| Offers | `/hotel/offers` | ✅ Done |
| Reviews | `/hotel/reviews` | ✅ Done |

### Booking Flow

| Page | Route | Status |
|------|-------|--------|
| Payment | `/booking/[id]/payment` | ✅ Done |
| Confirmation | `/booking/[id]/confirmation` | ✅ Done |

### Guest Dashboard

| Page | Route | Status |
|------|-------|--------|
| Dashboard Home | `/dashboard` | ✅ Done |
| My Bookings | `/dashboard/bookings` | ✅ Done |
| My Reviews | `/dashboard/reviews` | ✅ Done |
| Profile | `/dashboard/profile` | ✅ Done |
| Settings | `/dashboard/settings` | ✅ Done |
| Notifications Inbox | `/dashboard/notifications` | ✅ Done | GraphQL API + frontend page with mark-read, mark-all, load-more |

### Hotel Admin Pages (15 pages)

| Page | Route | Status |
|------|-------|--------|
| Admin Dashboard | `/admin` | ✅ Done |
| Bookings | `/admin/bookings` | ✅ Done |
| Rooms | `/admin/rooms` | ✅ Done |
| Smart Pricing | `/admin/smart-pricing` | ✅ Done |
| Pricing Calendar | `/admin/pricing` | ✅ Done |
| Payments | `/admin/payments` | ✅ Done |
| Walk-in Booking | `/admin/walk-in` | ✅ Done |
| Reviews | `/admin/reviews` | ✅ Done |
| Analytics | `/admin/analytics` | ✅ Done |
| Gallery | `/admin/gallery` | ✅ Done |
| Content | `/admin/content` | ✅ Done |
| Blog | `/admin/blog` | ✅ Done |
| SEO | `/admin/seo` | ✅ Done |
| Branding | `/admin/branding` | ✅ Done |
| Settings | `/admin/settings` | ✅ Done |

### Platform Admin Pages (5 pages)

| Page | Route | Status |
|------|-------|--------|
| Platform Dashboard | `/platform-admin` | ✅ Done |
| Hotels Management | `/platform-admin/hotels` | ✅ Done |
| Commissions | `/platform-admin/commissions` | ✅ Done |
| Analytics | `/platform-admin/analytics` | ✅ Done |
| Moderation | `/platform-admin/moderation` | ✅ Done |

### Components

| Component | Status |
|-----------|--------|
| Booking Widget | ✅ Done |
| Availability Calendar | ✅ Done |
| Hero Search Bar | ✅ Done |
| Hotel Card | ✅ Done |
| Hotel Search | ✅ Done |
| Hotel Filters | ✅ Done |
| Hotel Grid | ✅ Done |
| Hotel Gallery | ✅ Done |
| Hotel Info | ✅ Done |
| Hotel Map (Leaflet) | ✅ Done |
| Review Section | ✅ Done |
| Review Form | ✅ Done |
| Room Card | ✅ Done |
| Header (responsive) | ✅ Done |
| Footer | ✅ Done |
| Tenant Header (branded) | ✅ Done |
| Tenant Footer | ✅ Done |
| Push Notification Prompt | ✅ Done |
| Service Worker Registration | ✅ Done |

### Multi-Tenant System

| Feature | Status | Notes |
|---------|--------|-------|
| Domain-Based Routing | ✅ Done | Middleware fetches from API (`/api/domain-resolve`), in-memory cache with 5m TTL |
| Subdomain Detection | ✅ Done | `*.bluestay.in` pattern matched |
| Tenant Context Provider | ✅ Done | Headers-based tenant detection |
| Dynamic Theme Application | ✅ Done | CSS variables injected from `themeConfig` |
| Custom Theme Picker (Admin) | ✅ Done | Color pickers, presets, typography, **template selector** |

### Template System (NEW)

| Feature | Status | Notes |
|---------|--------|-------|
| Template Enum on Hotel | ✅ Done | STARTER, MODERN_MINIMAL, LUXURY_RESORT, HERITAGE_BOUTIQUE |
| Modern Minimal Template | ✅ Done | Clean asymmetric hero, floating search, minimal rooms grid |
| Luxury Resort Template | ✅ Done | Full-viewport cinematic hero, serif typography, dark sections |
| Heritage Boutique Template | ✅ Done | Warm sepia tones, ornamental dividers, story-driven layout |
| Template Registry (lazy-load) | ✅ Done | Dynamic imports, code-split per template |
| Admin Template Selector | ✅ Done | Visual picker in /admin/branding with preview swatches |
| Shared Search Widget | ✅ Done | 3 variants (default, minimal, luxury) |
| Shared Amenity Icons/Labels | ✅ Done | Reusable across all templates |

### SEO & PWA

| Feature | Status | Notes |
|---------|--------|-------|
| Dynamic `<meta>` tags | ✅ Done | `generateMetadata` on key pages |
| Sitemap.xml | ✅ Done | Dynamic from API |
| Robots.txt | ✅ Done | |
| PWA Manifest | ✅ Done | |
| Service Worker | ✅ Done | Cache-first for static, network-first for API |
| Offline Page | ✅ Done | |
| Google Analytics / GTM | ✅ Done | `<Script>` components in root layout, `NEXT_PUBLIC_GA_MEASUREMENT_ID` + `NEXT_PUBLIC_GTM_ID` env vars |

---

## Infrastructure & DevOps

| Feature | Status | Notes |
|---------|--------|-------|
| Docker Compose (dev) | ✅ Done | Postgres + Redis + API + Web |
| Docker Compose (prod) | ✅ Done | + Nginx, resource limits |
| Nginx Reverse Proxy | ✅ Done | Rate limiting, gzip, security headers |
| GitHub Actions CI | ✅ Done | Build + test for API + Web |
| Database Backup Script | ✅ Done | pg_dump + S3 upload |
| Database Restore Script | ✅ Done | From local or S3 |
| Seed Script | ✅ Done | 2 hotels, 5 room types, 4 users, sample bookings |
| `.env.example` Files | ✅ Done | API + Web + Production |
| Sentry (API) | ✅ Done | `@sentry/node` installed + configured |
| Sentry (Web) | ✅ Done | `@sentry/nextjs` installed |
| SSL/TLS (Let's Encrypt) | ✅ Done | Nginx config ready, certbot instructions |
| Turborepo | ✅ Done | Build pipeline configured |
| Shared Packages | ✅ Done | config, types, ui, utils |

---

## Testing

| Category | Status | Notes |
|----------|--------|-------|
| Auth Unit Tests | ✅ Done | 12 tests (register, login, OTP, refresh) |
| Booking Unit Tests | ✅ Done | 10 tests (create, cancel, modify) |
| Admin Unit Tests | ✅ Done | 10 tests (dashboard, stats) |
| Notification Unit Tests | ✅ Done | 8 tests (email + push) |
| E2E: API Health | ✅ Done | Playwright |
| E2E: Auth Flow | ✅ Done | Playwright |
| E2E: Booking Flow | ✅ Done | Playwright |
| E2E: Homepage | ✅ Done | Playwright |
| Load Test: Booking | ✅ Done | k6 |
| Load Test: Stress | ✅ Done | k6 |
| Payment Unit Tests | ❌ Missing | |
| Room/Availability Tests | ❌ Missing | |
| Commission Tests | ❌ Missing | |
| Review Tests | ❌ Missing | |
| Frontend Component Tests | ❌ Missing | No React Testing Library |
| Visual Regression Tests | ❌ Missing | |

---

## Remaining Work — Prioritized

### P0 — Critical (Must Have for Launch): ALL COMPLETE

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | **Password Reset Flow** | ✅ Done | Backend mutations + email template + frontend pages |
| 2 | **Email Verification** | ✅ Done | Token-based, auto-sent on register, verify + resend mutations |
| 3 | **Auto-Cancel: Release Inventory** | ✅ Done | Transactional release of RoomInventory + HourlySlot |
| 4 | **Dynamic Domain Routing** | ✅ Done | API endpoint `/api/domain-resolve`, middleware with cache |
| 5 | **Dynamic CORS** | ✅ Done | Async origin callback with Redis→DB lookup |
| 6 | **Install `@sentry/nextjs`** | ✅ Done | Already in dependencies |

### P1 — Important (Should Have): ALL COMPLETE

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 7 | **Google Analytics / GTM** | ✅ Done | `<Script>` tags in root layout |
| 8 | **Audit Log DB Persistence** | ✅ Done | `AuditLog` model + interceptor persists to DB |
| 9 | **Review Rejection** | ✅ Done | `approveReview` + `rejectReview` mutations |
| 10 | **GDPR Account Deletion** | ✅ Done | `deleteMyAccount` mutation with PII anonymization |
| 11 | **In-App Notification Inbox** | ✅ Done | `Notification` model + `InboxService` + GraphQL resolver |
| 12 | **Site Export (ZIP)** | ✅ Done | `ExportModule` generates themed static site ZIP |

### P2 — Nice to Have: MOSTLY COMPLETE

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 13 | **Stripe Payment Gateway** | ✅ Done | `StripeGateway` class, auto-selected via env |
| 14 | **Multi-Hotel Admin** | ❌ Deferred | Requires schema + UI changes, low priority |
| 15 | **Internationalization (i18n)** | ❌ Deferred | Requires `next-intl` + full string extraction |
| 16 | **Additional Test Coverage** | ❌ Deferred | Payment, room, commission, review, frontend tests |
| 17 | **Account Lockout** | ✅ Done | Redis-based: 5 failed attempts → 15 min lockout |
| 18 | **Visual Regression Testing** | ❌ Deferred | Playwright screenshots |

---

## Feature Implementation Plans

### 1. Custom Domain Provisioning

**Current State:** Domain → hotel mapping is hardcoded in `middleware.ts`. The `HotelDomain` model exists in Prisma schema but is unused by the middleware.

**Implementation Plan:**

```
Phase 1: Dynamic Domain Resolution (Backend)
├── Create API endpoint: GET /api/resolve-domain?domain=radhikaresort.in
│   └── Query HotelDomain table → return hotel slug + ID
├── Cache domain→hotel mapping in Redis (TTL: 5 min)
├── Add platform admin mutation: addHotelDomain(hotelId, domain)
└── Add domain verification (DNS TXT record check)

Phase 2: Dynamic Domain Resolution (Frontend)
├── Update middleware.ts to call API for unknown domains
├── Cache resolved domains in middleware using Redis or Next.js cache
├── Fallback to aggregator mode if domain not found
└── Remove hardcoded HOTEL_DOMAIN_MAP

Phase 3: Dynamic CORS
├── Update main.ts CORS origin callback
│   └── Check domain against HotelDomain table (cached in Redis)
├── Allow all *.bluestay.in subdomains via regex
└── Log rejected CORS origins for debugging

Phase 4: Self-Service Domain Setup (Admin UI)
├── Admin Settings page: "Custom Domain" section
│   ├── Input field for domain name
│   ├── DNS instructions (A record → server IP)
│   ├── TXT record verification step
│   └── SSL status indicator
├── Platform admin can manage domains for any hotel
└── Auto-SSL via Let's Encrypt (certbot API or caddy proxy)
```

**How a hotel like Radhika Resort gets a custom domain:**
1. Hotel admin goes to `/admin/settings` → Custom Domain section
2. Enters `radhikaresort.in`
3. System shows DNS instructions: "Add A record pointing to `<server-ip>`"
4. System generates TXT verification record: "Add TXT record `bluestay-verify=abc123`"
5. Admin configures DNS at their registrar
6. System verifies DNS → activates domain → SSL auto-provisioned
7. `radhikaresort.in` now serves the hotel's white-label site

---

### 2. Custom Theme Selection

**Current State: FULLY WORKING** — This is already implemented!

- **Admin UI** (`/admin/branding`): Color pickers for primary/secondary/accent colors, preset themes (Classic Blue, Sunset Orange, Forest Green, etc.), font selection, logo upload
- **Backend**: `updateHotelContent` mutation saves `themeConfig` JSON to `Hotel.themeConfig`
- **Frontend**: `TenantContext.applyTheme()` injects CSS variables (`--tenant-primary`, `--tenant-accent`, etc.) into `:root`, generates full shade palettes

**What a hotel admin sees:**
1. Go to `/admin/branding`
2. Pick a preset theme (e.g., "Royal Purple") or customize individual colors
3. Upload logo and favicon
4. Preview changes live
5. Save — theme immediately applies to their white-label site

**No additional work needed** for basic theming. Potential enhancements:
- [ ] Layout template selection (hero style, section ordering)
- [ ] Custom CSS injection for advanced users
- [ ] Theme preview before publish (draft mode)

---

### 3. Site Export (ZIP) for Self-Hosting

**Current State:** Not implemented at all.

**Concept:** Allow a hotel to download their entire white-label site as a static ZIP that can be hosted on any web server (Netlify, Vercel, shared hosting, etc.).

**Implementation Plan:**

```
Phase 1: Static Site Generator Service (Backend)
├── New module: apps/api/src/modules/export/
│   ├── export.service.ts
│   │   ├── generateStaticSite(hotelId): Promise<Buffer>
│   │   ├── Steps:
│   │   │   ├── 1. Fetch all hotel data (details, rooms, gallery, reviews, blog)
│   │   │   ├── 2. Render each page to static HTML using hotel's theme
│   │   │   ├── 3. Download all images to local assets/
│   │   │   ├── 4. Generate CSS with theme variables baked in
│   │   │   ├── 5. Create contact form as mailto: or external form service
│   │   │   ├── 6. Create index.html, rooms.html, about.html, gallery.html, etc.
│   │   │   ├── 7. Optionally embed booking widget as iframe or link to BlueStay
│   │   │   ├── 8. Package everything into ZIP using archiver
│   │   │   └── 9. Return Buffer (or upload to S3 with signed URL)
│   │   └── Template engine: Handlebars or EJS for static HTML generation
│   ├── export.controller.ts
│   │   └── GET /api/export/site/:hotelId → streams ZIP download
│   └── templates/
│       ├── index.hbs
│       ├── rooms.hbs
│       ├── room-detail.hbs
│       ├── gallery.hbs
│       ├── about.hbs
│       ├── contact.hbs
│       ├── reviews.hbs
│       └── blog-post.hbs
└── Include: CSS (Tailwind standalone build), JS (minimal vanilla), images, favicon

Phase 2: Admin UI
├── Add "Export Site" button in /admin/settings
├── Options:
│   ├── Include blog posts? [yes/no]
│   ├── Include reviews? [yes/no]
│   ├── Booking button behavior:
│   │   ├── Link to BlueStay (redirect to aggregator booking page)
│   │   ├── Embed BlueStay booking widget (iframe)
│   │   └── Remove booking (information-only site)
│   └── Contact form: mailto link vs embedded form
├── Progress indicator (generation can take 10-30 seconds)
└── Download ZIP button when ready

Phase 3: Enhancements
├── Multiple export templates (modern, classic, minimal)
├── Auto-regenerate on content change (queue job)
├── S3 hosted preview URL before download
└── Custom domain redirect config in exported site
```

**What the exported ZIP contains:**
```
radhika-resort-site/
├── index.html              # Homepage with hero, rooms, testimonials
├── rooms.html              # All room types with photos and prices
├── rooms/
│   ├── deluxe-room.html    # Individual room pages
│   └── super-deluxe.html
├── gallery.html            # Photo gallery with lightbox
├── about.html              # About the hotel
├── contact.html            # Contact info + map embed
├── reviews.html            # Guest reviews
├── blog/
│   ├── index.html          # Blog listing
│   └── post-slug.html      # Individual posts
├── assets/
│   ├── css/
│   │   └── style.css       # Tailwind + theme colors baked in
│   ├── js/
│   │   └── main.js         # Lightbox, mobile menu, smooth scroll
│   ├── images/
│   │   ├── logo.png
│   │   ├── hero.jpg
│   │   ├── rooms/          # Room photos
│   │   └── gallery/        # Gallery photos
│   └── fonts/              # If custom fonts selected
├── favicon.ico
├── manifest.json           # PWA manifest
├── robots.txt
├── sitemap.xml
└── README.txt              # Hosting instructions
```

---

### 4. Summary: What's Complete vs What's Left

```
COMPLETE (85%)
══════════════
✅ Full booking engine (daily + hourly + walk-in)
✅ Real-time availability with Redis locks
✅ Payment processing (Razorpay + Demo)
✅ Webhook verification (HMAC SHA256)
✅ Invoice PDF generation (PDFKit)
✅ Commission tracking + settlement + disputes
✅ Smart pricing engine
✅ Hotel search + filters + pagination
✅ Hotel onboarding (self-service)
✅ Blog CRUD with publish lifecycle
✅ SEO meta management + dynamic sitemap/robots
✅ OpenGraph + Twitter Card meta tags
✅ Gallery management (upload, reorder, delete)
✅ Review system (submit, reply, moderate)
✅ Custom theme/branding (admin UI + CSS variables)
✅ White-label tenant system (domain routing + branded UI)
✅ Email notifications (HTML templates)
✅ SMS + WhatsApp (MSG91)
✅ Web push notifications (VAPID)
✅ User profile management
✅ Redis caching + distributed locks
✅ BullMQ job queues + scheduled tasks
✅ Rate limiting (3-tier throttle)
✅ Security headers (Helmet + Nginx)
✅ Docker Compose (dev + prod)
✅ Nginx reverse proxy with SSL
✅ GitHub Actions CI
✅ Database backup/restore scripts
✅ Playwright E2E tests
✅ k6 load tests
✅ Unit tests (4 suites, ~40 tests)
✅ 45 Next.js pages (fully implemented)
✅ 21 React components (responsive)
✅ PWA (manifest + service worker + offline)
✅ Leaflet map integration
✅ Mobile responsive (Tailwind breakpoints)
✅ Shared packages (config, types, ui, utils)

REMAINING (15%)
═══════════════
P0 — Critical:
  ❌ Password reset flow (backend + frontend)
  ❌ Email verification
  ❌ Auto-cancel inventory release
  ❌ Dynamic domain routing (middleware → DB/Redis)
  ❌ Dynamic CORS for hotel domains
  ❌ Install @sentry/nextjs dependency

P1 — Important:
  ❌ Google Analytics / GTM script injection
  ❌ Audit log DB persistence
  ❌ Review rejection with reason
  ❌ GDPR account hard deletion
  ❌ In-app notification inbox
  ❌ Site export (ZIP) for self-hosting

P2 — Nice to Have:
  ❌ Stripe payment gateway
  ❌ Multi-hotel admin support
  ❌ Internationalization (i18n)
  ❌ Additional test coverage
  ❌ Account lockout (brute force prevention)
  ❌ Visual regression testing
```

---

*This file is the single source of truth for project status. Update it as features are completed.*
