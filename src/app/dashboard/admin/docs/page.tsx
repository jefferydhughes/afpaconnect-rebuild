import Link from 'next/link'
import { requireAdmin } from '@/lib/require-role'
import {
  BookOpen, Building2, Users, Mail, FileText, BarChart3, Settings,
  MapPin, Briefcase, FlaskConical, ChevronRight, ExternalLink,
  CheckCircle, AlertTriangle, Info, Database, Key, Globe,
  UserCheck, PlusCircle, Pencil, Trash2, Eye, RefreshCw,
  ShieldCheck, HelpCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Step {
  action: string
  detail: string
  note?: string
  warning?: string
}

interface Section {
  id: string
  title: string
  icon: React.ElementType
  color: string
  href?: string
  description: string
  steps: Step[]
}

// ─── Content ──────────────────────────────────────────────────────────────────

const sections: Section[] = [
  {
    id: 'franchises',
    title: 'Franchise Listings',
    icon: Building2,
    color: 'bg-blue-500',
    href: '/dashboard/admin/franchises',
    description: 'Add, edit, and manage all franchise brands listed on the platform.',
    steps: [
      { action: 'Add a new franchise', detail: 'Go to Franchises → click "Add New Franchise". Fill in the brand name, category, investment range, description, and logo URL. Set "Active" to publish it to the public directory.' },
      { action: 'Edit an existing franchise', detail: 'Click any franchise row to open the edit view. Update any field and save. Changes are live immediately.' },
      { action: 'Activate / deactivate a listing', detail: 'Toggle the "is_active" field. Inactive listings are hidden from the public /directory page but remain in the database.' },
      { action: 'Delete a franchise', detail: 'Use the delete button on the franchise detail page. This permanently removes the record and cannot be undone.', warning: 'Deleting a franchise also removes it from any saved quiz match results and lead associations.' },
      { action: 'Add a Franchisor account', detail: 'First create the franchise listing. Then go to Users, find the user, and change their role to "franchisor" in Supabase. The associated_franchise_id on their profile should match the franchise record ID.' },
    ],
  },
  {
    id: 'users',
    title: 'Users & Roles',
    icon: Users,
    color: 'bg-violet-500',
    href: '/dashboard/admin/users',
    description: 'Manage user accounts and assign platform roles.',
    steps: [
      { action: 'View all users', detail: 'Go to Users to see every registered account with their email, role, and sign-up date.' },
      { action: 'Change a user\'s role', detail: 'Roles are set in the Supabase dashboard → Table Editor → profiles → find the user row → edit the "role" column. Valid roles: admin, advisor, franchisor, franchise_rep, user.', note: 'Role changes take effect on the user\'s next page load or login.' },
      { action: 'The 5 platform roles', detail: 'admin: full platform access. advisor: manages their own lead pipeline. franchisor: manages their brand listing and sees its leads. franchise_rep: handles applications for a specific brand. user: prospective franchisee (default after signup).' },
      { action: 'Reset a user password', detail: 'Go to Supabase dashboard → Authentication → Users → find the user → click "Send password reset email".' },
      { action: 'Delete a user', detail: 'In Supabase → Authentication → Users → select the user → Delete. This also removes their profile row due to the cascade trigger.', warning: 'Deletion is permanent. Their leads and quiz results remain but will show a null user_id.' },
    ],
  },
  {
    id: 'advisors',
    title: 'Advisors',
    icon: Briefcase,
    color: 'bg-teal-500',
    href: '/dashboard/admin/advisors',
    description: 'Manage franchise advisor profiles shown on the /advisors directory and /our-team page.',
    steps: [
      { action: 'Add a new advisor profile', detail: 'Go to Advisors → "Add New Advisor". Fill in name, title, bio, photo URL, calendar link, and specialties. Set is_active to true to make them visible.' },
      { action: 'Feature an advisor on /our-team', detail: 'Set "is_leadership" to true on the advisor record. Only advisors with is_leadership = true appear on the /our-team page.' },
      { action: 'Set display order', detail: 'Use the "display_order" field (integer). Lower numbers appear first. Leave blank for alphabetical fallback.' },
      { action: 'Embed a calendar', detail: 'Paste the full Calendly or Cal.com embed code into the "calendar_embed_code" field. This appears on the advisor\'s public profile page.' },
      { action: 'Link an advisor to a user account', detail: 'Set the advisor\'s profile user account role to "advisor" in Supabase. The advisor dashboard (/dashboard/advisor) uses the profiles table, not the advisor table directly.' },
    ],
  },
  {
    id: 'leads',
    title: 'Leads',
    icon: Mail,
    color: 'bg-amber-500',
    href: '/dashboard/admin/leads',
    description: 'View and manage all incoming leads from the quiz, directory, and contact forms.',
    steps: [
      { action: 'Lead statuses', detail: 'new → contacted → qualified → nurturing → converted → unqualified. Update status as you work each lead to keep the pipeline current.' },
      { action: 'Lead sources', detail: 'Each lead shows its source: quiz (from the Fran chatbot quiz), directory_inquiry (from a franchise listing), website (contact form), referral, advertising, or social_media.' },
      { action: 'Assign a lead to an advisor', detail: 'Set the "attributed_advisor_id" field on the lead to the advisor\'s profile UUID. That lead will then appear in the advisor\'s dashboard.' },
      { action: 'View a lead\'s quiz results', detail: 'If the lead came from the quiz, their quiz_result_id is linked. Open Quiz Results and search by that ID to see their full franchise match profile.' },
      { action: 'Export leads', detail: 'From the Supabase dashboard → Table Editor → leads → click "Export to CSV" for a full data export.', note: 'The admin UI does not currently have a built-in export button.' },
    ],
  },
  {
    id: 'quizzes',
    title: 'Quiz Results & FranchiseFit360',
    icon: FileText,
    color: 'bg-green-500',
    href: '/dashboard/admin/quizzes',
    description: 'Review franchise matching quiz results and FranchiseFit360 psychometric profiles.',
    steps: [
      { action: 'The two assessment systems', detail: 'The platform has two separate tools: (1) The Fran Quiz (/quiz) — a conversational chatbot that collects budget, goals, and preferences to match franchises. (2) FranchiseFit360 (/fit360) — a 60-question psychometric assessment measuring personality traits across 5 dimensions.' },
      { action: 'View a Fran Quiz result', detail: 'Go to Quiz Results in the admin dashboard. Each row shows the user\'s email, matched franchises, AI profile summary, and quiz date.' },
      { action: 'View a FranchiseFit360 profile', detail: 'Go to /fit360/results in a browser. Append ?email=user@example.com to view a specific user\'s profile. As admin you can view any profile.' },
      { action: 'Download a FranchiseFit360 PDF report', detail: 'On the /fit360/results page, click "Download PDF Report". The PDF includes the radar chart, top traits, and franchise compatibility recommendations.' },
      { action: 'Anonymous quiz completions', detail: 'Users who take FranchiseFit360 without logging in are saved with a null user_id but a session_id. Their results are accessible via the session URL they received on the results page.' },
    ],
  },
  {
    id: 'location-pages',
    title: 'Location Pages',
    icon: MapPin,
    color: 'bg-rose-500',
    href: '/dashboard/admin/location-pages',
    description: 'Manage AI-generated local SEO landing pages for franchise brands.',
    steps: [
      { action: 'What location pages do', detail: 'Each page targets a "[Brand] franchise in [City]" search query. They are auto-generated with market data, population info, and AI-written copy. URLs follow the pattern /locations/[brand-slug]/[city-slug].' },
      { action: 'Create a new location page', detail: 'In the Location Pages admin view, add a new record with brand, city, country, and slug. Set status to "published" to make it live.' },
      { action: 'Edit AI-generated content', detail: 'The ai_generated_content field contains the body copy. Edit it directly in the admin UI or in Supabase table editor.' },
      { action: 'Bulk creation', detail: 'For large rollouts (e.g., 50 cities for one brand), use the Supabase SQL editor or import a CSV via Table Editor. Ask your developer to run the generation script.' },
      { action: 'SEO fields', detail: 'Always fill in meta_title and meta_description for each page. These appear in Google search results. Keep meta_title under 60 characters and meta_description under 160.' },
    ],
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: BarChart3,
    color: 'bg-indigo-500',
    href: '/dashboard/admin/analytics',
    description: 'Platform-wide performance metrics, lead funnel, and conversion tracking.',
    steps: [
      { action: 'Key metrics explained', detail: 'Total Leads: all entries in the leads table. Qualified Leads: leads with status "qualified" or "converted". Conversion Rate: qualified ÷ total. Quiz Completions: rows in quiz_results with quiz_completed_at set.' },
      { action: 'Lead funnel', detail: 'The funnel tracks visitors → quiz started → quiz completed → info requested → qualified → application submitted. Drop-off at each stage shows where to focus improvement.' },
      { action: 'Source breakdown', detail: 'Shows which channels are driving leads. Use this to evaluate paid ad spend vs organic vs referral performance.' },
      { action: 'Date filtering', detail: 'Use the date range filter to compare periods. Compare month-over-month to track growth after marketing campaigns or new franchise listings.' },
      { action: 'Exporting data', detail: 'For deeper analysis, export raw tables from Supabase (leads, quiz_results, franchise) to CSV and open in Excel or Google Sheets.' },
    ],
  },
  {
    id: 'demo',
    title: 'Sales Demo Builder',
    icon: FlaskConical,
    color: 'bg-orange-500',
    href: '/demo/builder',
    description: 'Create branded demo sessions to use during sales calls with prospective franchisors.',
    steps: [
      { action: 'Create a demo session', detail: 'Go to /demo/builder. Enter the prospect\'s franchise name and optional logo URL. Click "Create Demo Session". A shareable link is generated automatically.' },
      { action: 'Share the demo link', detail: 'Click "Copy Link" on the session card. Send this to the prospect before the call, or open it yourself during a screen share. The link works for 24 hours.' },
      { action: 'Demo modules', detail: 'Each demo includes: Applications Viewer, Interest Heatmap, Analytics Dashboard, Candidate Profiles, and Brand City Pages — all populated with simulated data branded to the prospect.' },
      { action: 'Walkthrough mode', detail: 'Click "Start Walkthrough" (bottom-left of any demo page) to enable guided tooltips. Choose a scenario (Standard, Quick, Lead Gen Focus, Territory Expansion) to match your call objective.' },
      { action: 'Sessions are stored locally', detail: 'Demo sessions are saved in your browser\'s localStorage. They are not stored on a server. Use the same browser/device to manage your sessions, and they expire after 24 hours.' },
    ],
  },
  {
    id: 'settings',
    title: 'Platform Settings',
    icon: Settings,
    color: 'bg-slate-600',
    href: '/dashboard/admin/settings',
    description: 'Global platform configuration, branding, and notification settings.',
    steps: [
      { action: 'Update platform branding', detail: 'Logo, brand colors, and contact details can be updated in Settings. These values appear in system emails and the admin UI.' },
      { action: 'Notification settings', detail: 'Configure where new lead notifications are sent. Currently supports email. Set the notification email address in Settings.' },
      { action: 'API keys and integrations', detail: 'Third-party integrations (e.g., Resend for email, future CRM connectors) are configured via environment variables in Vercel/your hosting platform, not through this UI.', note: 'Never paste API keys into this settings form — use the Vercel Environment Variables panel instead.' },
    ],
  },
  {
    id: 'technical',
    title: 'Technical Reference',
    icon: Database,
    color: 'bg-slate-800',
    description: 'For developers and technically confident administrators.',
    steps: [
      { action: 'Tech stack', detail: 'Next.js 14 App Router · Supabase (PostgreSQL + Auth) · Tailwind CSS · shadcn/ui components · Vercel deployment · Recharts for data viz · jsPDF for PDF reports.' },
      { action: 'Environment variables', detail: 'NEXT_PUBLIC_SUPABASE_URL — your Supabase project URL. NEXT_PUBLIC_SUPABASE_ANON_KEY — public anon key for browser client. SUPABASE_SERVICE_ROLE_KEY — server-only key with full DB access (never expose to browser).', warning: 'The service role key bypasses all Row Level Security. Keep it server-side only.' },
      { action: 'Database access', detail: 'Log into supabase.com → your project → Table Editor for GUI-based data management. Use SQL Editor for bulk operations. All major tables: profiles, franchise, leads, quiz_results, advisor, fit360_profile, fit360_response, location_pages.' },
      { action: 'Deploying updates', detail: 'Push to the main branch on GitHub. Vercel auto-deploys on every merge. Preview deployments are created for every pull request. Check the Vercel dashboard for build logs if a deploy fails.' },
      { action: 'Running database migrations', detail: 'New migrations are in /supabase/migrations/. Open each .sql file and paste the contents into the Supabase SQL Editor to run them. Do this in chronological order when setting up a new environment.' },
      { action: 'Adding a new franchise category', detail: 'Update the category enum in Supabase (supabase → Database → Enumerations or the franchise table column), then update the category options in src/components/admin/FranchiseForm.tsx and src/app/directory/page.tsx.' },
    ],
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default async function AdminDocsPage() {
  await requireAdmin('/login')

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-700" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Platform Guide</h1>
          </div>
          <p className="text-slate-600">Step-by-step instructions for every part of the AFPAConnect admin dashboard.</p>
        </div>

        {/* Quick nav */}
        <Card className="mb-10">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Jump to section</p>
            <div className="flex flex-wrap gap-2">
              {sections.map((s) => {
                const Icon = s.icon
                return (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-sm text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {s.title}
                  </a>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Role reference */}
        <Card className="mb-10 border-blue-200 bg-blue-50">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-900 mb-2">Platform Roles — Quick Reference</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2 text-sm">
                  {[
                    { role: 'admin', desc: 'Full platform management', dash: '/dashboard/admin' },
                    { role: 'advisor', desc: 'Their lead pipeline only', dash: '/dashboard/advisor' },
                    { role: 'franchisor', desc: 'Their brand & its leads', dash: '/dashboard/franchisor' },
                    { role: 'franchise_rep', desc: 'Applications for one brand', dash: '/dashboard/franchise-rep' },
                    { role: 'user', desc: 'Prospective franchisee', dash: '/dashboard' },
                  ].map((r) => (
                    <div key={r.role} className="p-2.5 bg-white rounded-lg border border-blue-100">
                      <Badge variant="outline" className="mb-1 text-xs font-mono">{r.role}</Badge>
                      <p className="text-xs text-slate-600">{r.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <div key={section.id} id={section.id} className="scroll-mt-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${section.color} text-white`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
                      <p className="text-sm text-slate-500">{section.description}</p>
                    </div>
                  </div>
                  {section.href && (
                    <Link
                      href={section.href}
                      className="hidden sm:flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Open <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>

                <Card>
                  <CardContent className="p-0 divide-y divide-slate-100">
                    {section.steps.map((step, idx) => (
                      <div key={idx} className="p-5 flex gap-4">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 mb-1">{step.action}</p>
                          <p className="text-sm text-slate-600 leading-relaxed">{step.detail}</p>
                          {step.note && (
                            <div className="mt-2 flex items-start gap-2 p-2.5 bg-blue-50 border border-blue-100 rounded-lg">
                              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-blue-800">{step.note}</p>
                            </div>
                          )}
                          {step.warning && (
                            <div className="mt-2 flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-amber-800">{step.warning}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>

        {/* Footer callout */}
        <Card className="mt-12 border-slate-200 bg-slate-900 text-white">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <HelpCircle className="w-6 h-6 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white mb-1">Need more help?</p>
                <p className="text-sm text-slate-300 mb-3">
                  For anything not covered here, contact your developer or check the Supabase dashboard directly.
                  The codebase lives at <span className="font-mono text-slate-200">afpaconnect-rebuild/</span> and every page is documented inline.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-blue-300 hover:text-blue-100 font-medium"
                  >
                    Supabase Dashboard <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <Link href="/demo/guide" className="flex items-center gap-1.5 text-sm text-blue-300 hover:text-blue-100 font-medium">
                    Sales Demo Guide <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
