# AFPA Connect Website Handover (V1)

This is a pre-filled handover document for the AFPA franchise matching platform.

## Document Control

- Project name: AFPA Connect / AFPA Franchise Matching Platform
- Website URL: https://afpaconnect.com
- Staging URL: [TO FILL]
- Repository: [TO FILL]
- Prepared by: [TO FILL]
- Date prepared: [TO FILL]
- Version: v1
- Primary business owner: [TO FILL]
- Primary technical owner: [TO FILL]

## 1. Executive Summary

### Purpose of this website
AFPA Connect helps prospective franchise owners discover opportunities, complete a fit quiz, and submit leads that can be attributed to advisors.

### What this website does
- Public marketing content and educational pages
- Franchise directory browsing and detail pages
- 7-question quiz flow with AI-supported matching
- Lead capture and advisor attribution
- Role-based dashboards for admin, advisor, franchisor, and franchise rep users

### Handover scope
- Included: application operations, lead flow, key admin tasks, technical runbook
- Excluded: paid media account ownership, external CRM playbooks, legal policy drafting

## 2. System Overview

### Tech stack
- Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Backend: Next.js route handlers under `src/app/api/*`
- Database/Auth: Supabase (PostgreSQL + Auth)
- AI: OpenAI (GPT + embeddings usage in quiz/admin generation paths)
- Deployment: Vercel (per `README.md`)

### High-level architecture
- Users navigate pages under `src/app/*`
- Quiz and admin actions call API routes under `src/app/api/*`
- API routes write/read Supabase tables (`quiz_results`, `leads`, `profiles`, etc.)
- Dashboards read filtered data by user role

### Environments
- Production: https://afpaconnect.com
- Staging: [TO FILL]
- Local: `http://localhost:3000` (default)

## 3. Access and Credentials

### Required accounts
- Vercel project access
- Supabase project access
- Domain/DNS provider access
- Git repository access
- Analytics/tracking tools (if enabled)
- OpenAI key management (if AI features are enabled)

### Access matrix
| System | Role needed | Owner | Backup owner |
|---|---|---|---|
| Vercel | Admin | [TO FILL] | [TO FILL] |
| Supabase | Admin | [TO FILL] | [TO FILL] |
| DNS/Domain | Admin | [TO FILL] | [TO FILL] |
| Git Repo | Maintainer | [TO FILL] | [TO FILL] |
| OpenAI | Billing/Admin | [TO FILL] | [TO FILL] |

### Credential storage policy
- Store secrets in password manager + platform env var managers (never in docs)
- Enforce MFA on Vercel, Supabase, Git, and DNS accounts
- Recovery process: [TO FILL]

## 4. Quick Start (Day 1)

### Critical links
- Production site: https://afpaconnect.com
- Login page: `/login`
- Dashboard landing: `/dashboard`
- Supabase project: [TO FILL]
- Vercel project: [TO FILL]
- Repository: [TO FILL]

### First-day checklist
- [ ] Confirm admin login works
- [ ] Confirm `/dashboard/admin` loads
- [ ] Submit a test quiz via `/quiz`
- [ ] Verify records in `quiz_results` and `leads`
- [ ] Verify advisor attribution using `?advisor=` or `?ref=`
- [ ] Confirm core admin pages load (users, leads, franchises)

## 5. Business Operations Manual (Task-Based)

### Task 1: Add or edit a franchise listing
- Purpose: Keep franchise catalog current
- Permission required: `admin` or authorized internal operator
- Steps:
1. Open Supabase Table Editor > `franchises`
2. Insert/update row values
3. Validate listing appears in directory and detail pages
- Expected result: Updated listing visible on public pages
- Common issues and fixes:
  - Missing required fields: complete schema-required columns
  - Slug/path issues: verify normalized naming fields

### Task 2: Manage advisor profiles
- Purpose: Maintain advisor roster and attribution readiness
- Permission required: `admin`
- Steps:
1. Open Supabase Table Editor > `profiles`
2. Set role to `advisor`
3. Fill advisor fields (`advisor_slug`, active flags, profile data)
- Expected result: Advisor appears in advisor workflows and can receive attributed leads
- Common issues and fixes:
  - No attributed leads: verify advisor UUID in referral link

### Task 3: Review and export leads
- Purpose: Sales follow-up and reporting
- Permission required: `admin`, `home_office`, or role-appropriate viewer
- Steps:
1. Open `quiz_results` / `leads` in Supabase
2. Filter by date/advisor/source
3. Export CSV for reporting
- Expected result: Accurate lead list and attribution metadata
- Common issues and fixes:
  - Missing advisor attribution: check referral params and mapping logic

### Task 4: Manage users and roles
- Purpose: Access governance
- Permission required: `admin`
- Steps:
1. Open `profiles`
2. Update role (`admin`, `home_office`, `advisor`, `franchisor`, `user`)
3. Have user re-login if role-dependent UI does not update immediately
- Expected result: Role-specific dashboard access updates correctly
- Common issues and fixes:
  - Wrong dashboard: verify profile role and session refresh

### Task 5: Publish content updates
- Purpose: Keep pages and educational content current
- Permission required: code/deployment access or admin DB access depending on content type
- Steps:
1. For code-driven content, update source in repo and deploy
2. For table-backed content, edit relevant Supabase table (for example `blog_posts`)
3. Validate live page output
- Expected result: Updated content visible in production
- Common issues and fixes:
  - Content not live: check deployment status/cache

## 6. Lead Flow and Attribution

### Lead flow summary
1. Visitor opens `/quiz`
2. Submission calls `/api/quiz/submit`
3. Quiz submission stored in `quiz_results`
4. Lead record created in `leads`
5. Advisor attribution applied when referral parameters are present

### Attribution rules
- Supported referral parameters:
  - `?advisor=ADVISOR_UUID`
  - `?ref=ADVISOR_UUID`
- Attribution fields:
  - `quiz_results.attributed_advisor_id`
  - `leads.attributed_advisor_id`
- Validation:
1. Open attributed link
2. Submit test quiz
3. Confirm advisor UUID in both tables

### Reporting definitions
- New lead: newly created row in `leads`
- Attributed lead: `attributed_advisor_id` is populated
- Conversion event: [TO FILL, based on downstream process]

## 7. Admin and Data Governance

### Core tables to monitor
- `profiles`
- `franchises`
- `quiz_results`
- `leads`
- `info_requests`
- `blog_posts`
- `fit360_assessments`

### Data quality checks (weekly)
- [ ] Missing contact fields in recent leads
- [ ] Null/invalid attribution IDs where referrals are expected
- [ ] Duplicate or stale advisor records
- [ ] Failed or partial quiz submissions

### Role model
- `admin`: full access
- `home_office`: broad read access, limited edits per policy
- `advisor`: access to advisor-related leads/workflows
- `franchisor`: listing and franchisor workflow access
- `user`: public/consumer flows

## 8. Technical Runbook

### Local development
- Prerequisites: Node.js 18+, npm
- Install:
```bash
npm install
```
- Run locally:
```bash
npm run dev
```
- Build:
```bash
npm run build
```
- Start production build locally:
```bash
npm run start
```

### Environment variables (code-observed)
| Variable | Purpose | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser auth/database access | Yes |
| `SUPABASE_URL` | Server-side fallback for URL | Optional |
| `SUPABASE_ANON_KEY` | Server-side fallback anon key | Optional |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged server operations | Recommended for admin APIs |
| `OPENAI_API_KEY` | AI matching/generation | Required for AI features |
| `AFPA_DEFAULT_ADMIN_EMAIL` / `ADMIN_EMAIL` | Default admin contact fallback | Optional |
| `RESEND_API_KEY` | Enables direct outbound email notifications | Optional (required for direct email) |
| `AFPA_EMAIL_FROM` / `EMAIL_FROM` | Sender identity for notification emails | Optional |
| `NEXT_PUBLIC_SITE_URL` / `SITE_URL` | Base URL used in email links | Optional |
| `AFPA_QUIZ_WEBHOOK_URL` | Quiz webhook integration endpoint | Optional |
| `AFPA_QUIZ_WEBHOOK_APIKEY` / `AFPA_QUIZ_WEBHOOK_BEARER` | Webhook auth | Optional |
| `AFPA_QUIZ_NOTIFICATION_WEBHOOK_URL` | Notification webhook endpoint | Optional |
| `AFPA_DEFAULT_ADMIN_ADVISOR_ID` / `DEFAULT_ADMIN_ADVISOR_ID` | Fallback advisor attribution | Optional |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for metadata/sitemap | Recommended |
| `VERCEL_URL` | Vercel runtime URL fallback | Automatic in Vercel |

### Deployment process (Vercel)
1. Push to the connected Git branch
2. Ensure environment variables are set in Vercel project settings
3. Trigger/verify deployment in Vercel dashboard
4. Smoke test: `/`, `/quiz`, `/directory`, `/dashboard`, `/api/quiz/submit`

### Rollback process
1. Open Vercel Deployments
2. Promote previous known-good deployment
3. Re-run smoke tests for critical flows

### Backup and restore
- Database backup: use Supabase backup/point-in-time controls per plan
- Restore owner: [TO FILL]
- Last restore drill date: [TO FILL]

## 9. Monitoring and Incident Response

### Monitoring checks
- Website uptime (home, quiz, directory)
- API error rates for `/api/quiz/submit`
- Lead volume anomalies day-over-day
- Supabase health and auth failures

### Alert routing
- Primary on-call: [TO FILL]
- Secondary on-call: [TO FILL]
- Notification channel: [TO FILL]

### Incident severity and SLA
| Severity | Definition | Response target | Owner |
|---|---|---|---|
| P1 | Site down or lead capture broken | [TO FILL] | [TO FILL] |
| P2 | Major feature degraded | [TO FILL] | [TO FILL] |
| P3 | Minor issue with workaround | [TO FILL] | [TO FILL] |

### Incident playbook
1. Verify scope and business impact
2. Check recent deploys, env var changes, Supabase status
3. Roll back deploy or apply hotfix
4. Validate lead capture and attribution
5. Document root cause and corrective action

## 10. Security and Compliance

### Security controls checklist
- [ ] MFA enabled on all admin systems
- [ ] Secrets only stored in env managers/password vaults
- [ ] Principle of least privilege applied to accounts
- [ ] Secrets rotation process documented

### Compliance references
- Privacy policy: `/privacy-policy`
- Terms: `/terms-and-conditions`
- Data retention/deletion process: [TO FILL]

## 11. Training and Handover Delivery

### Deliverables checklist
- [ ] Walkthrough recording delivered
- [ ] Operations manual accepted
- [ ] Technical runbook accepted
- [ ] Access transfer complete
- [ ] Test incident drill complete

### Suggested training agenda (60 minutes)
1. Platform overview (10 min)
2. Live admin workflows (20 min)
3. Lead attribution validation (10 min)
4. Technical runbook and rollback (15 min)
5. Q&A (5 min)

### Acceptance criteria
- [ ] New owner can perform 3 core tasks unassisted
- [ ] New owner can verify a quiz-to-lead record end-to-end
- [ ] Technical owner can roll back one deployment successfully

## 12. Open Issues and Future Improvements

| Priority | Item | Owner | Target date | Notes |
|---|---|---|---|---|
| High | Define and document staging environment | [TO FILL] | [TO FILL] | |
| High | Finalize SLA targets and escalation contacts | [TO FILL] | [TO FILL] | |
| Medium | Add automated smoke tests for quiz and lead flow | [TO FILL] | [TO FILL] | |
| Medium | Create dashboard/reporting definitions by stakeholder | [TO FILL] | [TO FILL] | |

## Appendix A: Key Route Inventory

### Core pages
- `/`
- `/login`
- `/quiz`
- `/quiz/results`
- `/directory`
- `/dashboard`
- `/dashboard/admin`
- `/dashboard/advisor`
- `/dashboard/franchisor`
- `/dashboard/franchise-rep`

### API routes
- `/api/quiz/submit`
- `/api/auth/callback`
- `/api/auth/signout`
- `/api/admin/create-advisor`
- `/api/admin/location-pages`
- `/api/admin/location-pages/generate`
- `/api/fit360/report`

## Appendix B: Change Log

| Date | Version | Change summary | Author |
|---|---|---|---|
| [TO FILL] | v1 | Initial pre-filled handover draft | Codex |
