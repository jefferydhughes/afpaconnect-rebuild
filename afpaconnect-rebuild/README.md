# AFPA - Franchise Matching Platform

The American Franchise Professionals Association platform - A modern franchise discovery platform with AI-powered matching, built with Next.js 14, Supabase, and OpenAI.

## Features

- 🎯 **AI-Powered Quiz** - 7-question conversational quiz that matches users with franchises
- 📊 **Franchise Directory** - Browse 600+ franchise listings with filters
- 🤖 **Smart Matching** - OpenAI embeddings + GPT-4 for intelligent recommendations
- 👥 **Advisor Attribution** - Track leads to advisors via URL parameters
- 🔐 **Role-Based Access** - Admin, Advisor, Franchisor, and User dashboards
- 📱 **Responsive Design** - Works on all devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **AI**: OpenAI (Embeddings + GPT-4o-mini)
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel

---

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works)
- OpenAI API key

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd afpaconnect-rebuild
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings > API** and copy your project URL and keys
3. Go to **SQL Editor** and run the migration:

```bash
# Copy the contents of supabase/migrations/001_initial_schema.sql
# and run it in the Supabase SQL Editor
```

Or use the Supabase CLI:
```bash
npx supabase db push
```

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-key
RESEND_API_KEY=re_xxxxxxxxx
AFPA_EMAIL_FROM="AFPAConnect Notifications <notifications@yourdomain.com>"
AFPA_DEFAULT_ADMIN_EMAIL=admin@yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 4. Import Franchise Data

Import your franchise CSV data into Supabase:

1. Go to **Table Editor > franchises**
2. Click **Import data from CSV**
3. Upload your `Franchise_export.csv` file
4. Map the columns accordingly

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment to Vercel

### Option A: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_REPO_URL)

### Option B: Manual Deploy

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in **Settings > Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
   - `RESEND_API_KEY`
   - `AFPA_EMAIL_FROM`
   - `AFPA_DEFAULT_ADMIN_EMAIL`
   - `NEXT_PUBLIC_SITE_URL`
4. Deploy!

### Connecting Your Domain

1. In Vercel, go to **Settings > Domains**
2. Add `afpaconnect.com` (or your domain)
3. Vercel will provide DNS records
4. Have your client add these DNS records:
   - **A Record**: `@` → `76.76.21.21`
   - **CNAME**: `www` → `cname.vercel-dns.com`

---

## For Non-Technical Users

### Adding/Editing Franchises

1. Log into [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **Table Editor > franchises**
3. Click a row to edit, or **Insert row** to add new

### Viewing Quiz Results & Leads

1. In Supabase, go to **Table Editor > quiz_results** or **leads**
2. Use filters to find specific records
3. Export to CSV if needed

### Managing Users

1. Go to **Table Editor > profiles**
2. Change user roles: `admin`, `advisor`, `franchisor`, `user`
3. For advisors, fill in `advisor_slug`, `advisor_is_active`, etc.

---

## Advisor Affiliate Links

Advisors get unique tracking links:

```
https://afpaconnect.com/quiz?advisor=ADVISOR_UUID
https://afpaconnect.com/quiz?ref=ADVISOR_UUID
```

All quiz submissions from these links are attributed to the advisor in:
- `quiz_results.attributed_advisor_id`
- `leads.attributed_advisor_id`

---

## Project Structure

```
src/
|-- app/                     # Next.js App Router pages and route handlers
|   |-- api/                 # Backend API routes (quiz, auth, admin, leads, etc.)
|   |-- dashboard/           # Admin/advisor dashboard pages
|   |-- directory/           # Franchise directory pages
|   |-- quiz/                # Quiz flow and results pages
|   |-- [many marketing pages: about, blog, contact, guides, regions...]
|   |-- layout.tsx
|   |-- not-found.tsx
|   |-- page.tsx             # Homepage
|   `-- sitemap.ts
|-- components/
|   |-- admin/               # Admin UI blocks
|   |-- advisor/             # Advisor-specific components
|   |-- assessment/          # Fit/assessment UI
|   |-- demo/                # Demo components
|   |-- directory/           # Directory UI components
|   |-- heatmap/             # Heatmap visualization components
|   |-- home/                # Homepage sections
|   |-- layout/              # Header, Footer, navigation
|   |-- providers/           # React context/providers
|   `-- ui/                  # Shared shadcn/ui primitives
|-- lib/
|   `-- supabase/            # Browser/server/middleware Supabase clients
`-- types/
    |-- database.ts          # Generated DB types
    `-- supabase.ts          # App-level Supabase typing helpers
```
---

## Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User accounts with roles |
| `franchises` | 600+ franchise listings |
| `quiz_results` | Quiz submissions + AI matches |
| `leads` | Converted leads from quizzes |
| `info_requests` | Franchise info requests |
| `blog_posts` | Blog content |
| `fit360_assessments` | Extended psychometric assessments |

### User Roles

| Role | Access |
|------|--------|
| `admin` | Full access to everything |
| `home_office` | View all data, limited edits |
| `advisor` | View their attributed leads |
| `franchisor` | Manage their franchise listing |
| `user` | Take quiz, view results |

---

## Customization

### Brand Colors

Edit `tailwind.config.ts`:

```typescript
brand: {
  navy: '#062234',      // Primary dark color
  gold: '#C19B3F',      // Accent color
  cream: '#F9F7F3',     // Background
}
```

### Quiz Questions

Edit `src/app/quiz/page.tsx` - the `QUIZ_QUESTIONS` array.

### AI Matching Logic

Edit `src/app/api/quiz/submit/route.ts` - the `getAIMatches` function.

---

## Support

For issues or questions:
1. Check existing GitHub issues
2. Create a new issue with details
3. For urgent production issues, contact the development team

---

## License

Private - All rights reserved.

