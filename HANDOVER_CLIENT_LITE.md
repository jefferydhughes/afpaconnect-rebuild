# AFPA Connect Website Handover Guide (Client Lite)

This guide is the non-technical version of the handover. It is designed for business owners, operators, and internal teams who will run the site day-to-day.

## 1. Key Links

- Live website: https://afpaconnect.com
- Login page: `/login`
- Dashboard: `/dashboard`
- Supabase dashboard (database/admin): [TO FILL]
- Support contact: [TO FILL]
- Emergency contact: [TO FILL]

## 2. What the Website Does

- Presents AFPA marketing and educational pages
- Lets users browse franchise opportunities
- Runs a quiz to match users with franchise options
- Captures and stores leads
- Attributes leads to advisors when referral links are used

## 3. User Roles (Simple View)

- `admin`: full control
- `home_office`: broad visibility with limited edit permissions
- `advisor`: sees advisor-relevant leads/workflows
- `franchisor`: manages franchisor/listing-related workflows
- `user`: standard visitor account

If someone sees the wrong dashboard or cannot access a page, check their role first.

## 4. Daily Operations Checklist

Use this as your daily/weekly cadence.

### Daily
- [ ] Confirm site home page loads
- [ ] Submit a quick test in `/quiz` (optional but recommended)
- [ ] Confirm new leads are appearing
- [ ] Check if any priority issues were reported

### Weekly
- [ ] Review total leads and attributed leads
- [ ] Review advisor activity and attribution accuracy
- [ ] Spot-check key pages for outdated content
- [ ] Export lead data if needed for reporting

## 5. Most Common Tasks

### Task A: Add or edit a franchise listing
1. Open Supabase dashboard
2. Go to `Table Editor > franchises`
3. Edit an existing row or insert a new row
4. Save and verify on the live directory page

### Task B: Review quiz submissions and leads
1. Go to `Table Editor > quiz_results` and `leads`
2. Filter by date/advisor/source as needed
3. Export CSV for reporting when needed

### Task C: Update user permissions
1. Go to `Table Editor > profiles`
2. Find the user
3. Update role (`admin`, `advisor`, etc.)
4. Ask user to log out and back in

### Task D: Verify advisor attribution
1. Use an advisor link format:
   - `https://afpaconnect.com/quiz?advisor=ADVISOR_UUID`
   - `https://afpaconnect.com/quiz?ref=ADVISOR_UUID`
2. Submit a test quiz
3. Confirm attribution appears in:
   - `quiz_results.attributed_advisor_id`
   - `leads.attributed_advisor_id`

## 6. Publishing and Content Updates

- Some content is updated in the database (for example blog-style records)
- Some content is code-based and requires developer deployment

When in doubt:
1. Check with technical owner whether the change is database-driven or code-driven
2. If code-driven, log a change request with desired text, page URL, and priority

## 7. Troubleshooting Quick Guide

### "I cannot log in"
- Confirm the correct email/account
- Confirm role exists in `profiles`
- Retry in private/incognito browser window
- Escalate to technical owner if unresolved

### "Lead is missing"
- Check both `quiz_results` and `leads`
- Verify date filters and search filters
- Confirm submission completed fully
- Escalate with timestamp + user email if available

### "Advisor did not get credited"
- Confirm the referral link used `advisor` or `ref` parameter
- Confirm advisor UUID is valid
- Re-run test using a fresh browser session

### "Page looks outdated"
- Hard refresh browser
- Confirm whether page is DB-driven or code-driven
- If code-driven, submit update request

## 8. Incident Response (Business Level)

### Severity levels
- Critical: Site down, quiz broken, leads not saving
- Major: Core dashboard/workflow partly broken
- Minor: Cosmetic or non-blocking issue

### What to do first
1. Record issue time and impact
2. Capture URL + screenshot + affected user details
3. Notify emergency contact
4. If needed, pause campaigns sending paid traffic until fixed

## 9. Handover Completion Checklist

- [ ] Access transferred to business owner(s)
- [ ] Access transferred to backup owner(s)
- [ ] Admin login tested
- [ ] Lead flow tested end-to-end
- [ ] Advisor attribution tested end-to-end
- [ ] Training session completed and recorded
- [ ] This document updated with final contacts

## 10. Contacts

- Business owner: [TO FILL]
- Technical owner: [TO FILL]
- Backup technical contact: [TO FILL]
- Hosting provider contact: [TO FILL]
- Database/admin platform contact: [TO FILL]

## 11. Change Log

| Date | Version | Summary | Owner |
|---|---|---|---|
| [TO FILL] | v1 | Initial client-lite handover guide | Codex |
