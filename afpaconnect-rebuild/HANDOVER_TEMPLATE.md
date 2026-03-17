# Website Handover Template

Use this document to hand over the website to operations, marketing, and technical owners.

## Document Control

- Project name:
- Website URL:
- Staging URL:
- Repository:
- Prepared by:
- Date prepared:
- Version:
- Primary business owner:
- Primary technical owner:

## 1. Executive Summary

### Purpose of this website
- 

### What this website does
- Public marketing pages
- Franchise directory and discovery
- Quiz + matching flow
- Lead capture and attribution
- Advisor/admin workflows

### Handover scope
- Included:
- Excluded:

## 2. System Overview

### Tech stack
- Frontend: Next.js (App Router), TypeScript, Tailwind
- Backend: Next.js API routes
- Database/Auth: Supabase
- Hosting/Deployment:
- Analytics/Tracking:

### High-level architecture
- User visits website pages (`src/app/*`)
- Forms/quiz submit to API routes (`src/app/api/*`)
- API routes read/write Supabase tables
- Admin/advisor dashboards display operational data

### Environments
- Production:
- Staging:
- Local:

## 3. Access and Credentials

### Required accounts
- Hosting provider:
- Domain/DNS provider:
- Supabase:
- Email provider:
- Analytics tools:
- Other third-party services:

### Access matrix
| System | Role needed | Owner | Backup owner |
|---|---|---|---|
| Hosting |  |  |  |
| Supabase |  |  |  |
| DNS |  |  |  |
| Repo |  |  |  |

### Credential storage policy
- Where credentials are stored:
- MFA required: Yes / No
- Recovery process:

## 4. Quick Start (Day 1)

### Critical links
- Production site:
- Admin login:
- Supabase project:
- Repo:
- Monitoring dashboard:

### First-day checklist
- [ ] Confirm admin login works
- [ ] Confirm dashboard loads
- [ ] Submit a test quiz and verify lead is saved
- [ ] Confirm advisor attribution flow
- [ ] Confirm contact/info request form works
- [ ] Confirm backup/report export access

## 5. Business Operations Manual (Task-Based)

> Keep each task short and operational.

### Task 1: Add or edit a franchise listing
- Purpose:
- Permission required:
- Steps:
1. 
2. 
3. 
- Expected result:
- Common issues and fixes:

### Task 2: Manage advisor profiles
- Purpose:
- Permission required:
- Steps:
1. 
2. 
3. 
- Expected result:
- Common issues and fixes:

### Task 3: Review and export leads
- Purpose:
- Permission required:
- Steps:
1. 
2. 
3. 
- Expected result:
- Common issues and fixes:

### Task 4: Manage users and roles
- Purpose:
- Permission required:
- Steps:
1. 
2. 
3. 
- Expected result:
- Common issues and fixes:

### Task 5: Publish blog or content updates
- Purpose:
- Permission required:
- Steps:
1. 
2. 
3. 
- Expected result:
- Common issues and fixes:

## 6. Lead Flow and Attribution

### Lead flow summary
1. User completes quiz
2. Quiz result stored in `quiz_results`
3. Lead record created in `leads`
4. Advisor attribution stored when referral params are present

### Attribution rules
- Query params supported:
- Fields updated:
- How to validate attribution:

### Reporting definitions
- New lead:
- Qualified lead:
- Attributed lead:
- Conversion event:

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
- [ ] Missing required fields in new leads
- [ ] Duplicate advisor IDs or slugs
- [ ] Broken franchise records
- [ ] Failed form submissions

### Role model
- `admin`:
- `home_office`:
- `advisor`:
- `franchisor`:
- `user`:

## 8. Technical Runbook

### Local development
- Prerequisites:
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

### Environment variables
| Variable | Purpose | Required | Example |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL | Yes |  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client key | Yes |  |
| `SUPABASE_SERVICE_ROLE_KEY` | Server/admin actions | If used |  |
| `OPENAI_API_KEY` | AI matching (if enabled) | If used |  |

### Deployment process
1. 
2. 
3. 

### Rollback process
1. 
2. 
3. 

### Backup and restore
- Backup schedule:
- Restore owner:
- Tested on (date):

## 9. Monitoring and Incident Response

### Monitoring checks
- Uptime:
- Form submission success rate:
- API error rate:
- Database performance:

### Alert routing
- Primary on-call:
- Secondary on-call:
- Notification channel:

### Incident severity and SLA
| Severity | Definition | Response target | Owner |
|---|---|---|---|
| P1 | Site down / lead capture broken |  |  |
| P2 | Major feature degradation |  |  |
| P3 | Minor issue / workaround exists |  |  |

### Incident playbook
1. Confirm scope and impact
2. Triage recent deployments/changes
3. Roll back or apply hotfix
4. Validate lead capture and critical paths
5. Publish status update and postmortem

## 10. Security and Compliance

### Security controls
- MFA enabled for all admin tools: Yes / No
- Least-privilege access enforced: Yes / No
- Secrets not committed to repo: Yes / No

### Compliance considerations
- Privacy policy URL:
- Terms URL:
- Data retention policy:
- Data deletion request process:

## 11. Training and Handover Delivery

### Deliverables checklist
- [ ] Walkthrough recording link:
- [ ] Operations manual complete
- [ ] Technical runbook complete
- [ ] Access transfer complete
- [ ] Recovery/rollback demo completed

### Training session plan
- Session date:
- Attendees:
- Agenda:
1. Product overview
2. Admin tasks live demo
3. Lead attribution validation
4. Technical runbook review
5. Q&A

### Acceptance criteria
- [ ] Receiving team can complete 3 core tasks unaided
- [ ] Receiving team can identify where to check lead failures
- [ ] Receiving team can execute rollback steps

## 12. Open Issues and Future Improvements

| Priority | Item | Owner | Target date | Notes |
|---|---|---|---|---|
| High |  |  |  |  |
| Medium |  |  |  |  |
| Low |  |  |  |  |

## Appendix A: URL and Route Inventory

### Key pages
- `/`
- `/quiz`
- `/quiz/results`
- `/directory`
- `/dashboard`
- `/login`

### Key API routes
- `/api/quiz/submit`
- `/api/auth/*`
- `/api/admin/*`

## Appendix B: Change Log

| Date | Version | Change summary | Author |
|---|---|---|---|
|  |  |  |  |
