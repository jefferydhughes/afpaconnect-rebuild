import { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/server'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://americanfranchiseprofessionalsalliance.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const admin = createAdminClient()

  // ── Static pages ────────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/directory`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/advisors`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/quiz`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${SITE_URL}/calculator`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/compare`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/education`, changeFrequency: 'monthly', priority: 0.5 },
  ]

  // ── Franchise directory pages ────────────────────────────────────────────────
  const franchiseTable = await (async () => {
    const probe = await admin.from('franchise').select('id').limit(1)
    return probe.error ? 'franchises' : 'franchise'
  })()

  const { data: franchises } = await admin
    .from(franchiseTable)
    .select('slug, updated_at')
    .eq('is_active', true)

  const franchisePages: MetadataRoute.Sitemap = (franchises || [])
    .filter((f: any) => f.slug)
    .map((f: any) => ({
      url: `${SITE_URL}/directory/${f.slug}`,
      lastModified: f.updated_at ? new Date(f.updated_at) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  // ── Advisor profile pages ────────────────────────────────────────────────────
  const { data: advisors } = await admin
    .from('advisor')
    .select('slug, updated_at')
    .eq('is_active', true)

  const advisorPages: MetadataRoute.Sitemap = (advisors || [])
    .filter((a: any) => a.slug)
    .map((a: any) => ({
      url: `${SITE_URL}/advisors/${a.slug}`,
      lastModified: a.updated_at ? new Date(a.updated_at) : undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))

  // ── Blog posts ───────────────────────────────────────────────────────────────
  const { data: posts } = await admin
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('is_published', true)

  const blogPages: MetadataRoute.Sitemap = (posts || [])
    .filter((p: any) => p.slug)
    .map((p: any) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))

  // ── Location pages (programmatic SEO) ───────────────────────────────────────
  const { data: locationPages } = await admin
    .from('location_pages')
    .select('brand_slug, city_slug, updated_at')
    .eq('status', 'available')

  const locationPageEntries: MetadataRoute.Sitemap = (locationPages || []).map((lp: any) => ({
    url: `${SITE_URL}/franchises/${lp.brand_slug}/${lp.city_slug}`,
    lastModified: lp.updated_at ? new Date(lp.updated_at) : undefined,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [
    ...staticPages,
    ...franchisePages,
    ...advisorPages,
    ...blogPages,
    ...locationPageEntries,
  ]
}
