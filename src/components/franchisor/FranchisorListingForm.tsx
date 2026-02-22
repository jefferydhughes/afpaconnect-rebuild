'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Loader2, Save, ExternalLink, Pencil } from 'lucide-react'
import { toast } from 'sonner'

type FormData = {
  is_featured: boolean
  hero_image_url: string | null
  intro_video_url: string | null
  info_pack_url: string | null
  apply_now_url: string | null
  request_info_embed: string | null
  gallery_image_1: string | null
  gallery_image_2: string | null
  gallery_image_3: string | null
  calendar_embed: string | null
  facebook_url: string | null
  instagram_url: string | null
  twitter_url: string | null
  linkedin_url: string | null
  youtube_url: string | null
  tiktok_url: string | null
  google_reviews_embed: string | null
  show_google_reviews: boolean
  seo_title: string | null
  seo_meta_description: string | null
}

type FranchiseInput = FormData & {
  id: string
  name: string
  slug: string
  logo_url?: string | null
  listing_plan?: string | null
  [key: string]: unknown
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

export function FranchisorListingForm({ franchise }: { franchise: FranchiseInput }) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)

  const [data, setData] = useState<FormData>({
    is_featured: (franchise.is_featured as boolean) ?? false,
    hero_image_url: (franchise.hero_image_url as string | null) ?? null,
    intro_video_url: (franchise.intro_video_url as string | null) ?? null,
    info_pack_url: (franchise.info_pack_url as string | null) ?? null,
    apply_now_url: (franchise.apply_now_url as string | null) ?? null,
    request_info_embed: (franchise.request_info_embed as string | null) ?? null,
    gallery_image_1: (franchise.gallery_image_1 as string | null) ?? null,
    gallery_image_2: (franchise.gallery_image_2 as string | null) ?? null,
    gallery_image_3: (franchise.gallery_image_3 as string | null) ?? null,
    calendar_embed: (franchise.calendar_embed as string | null) ?? null,
    facebook_url: (franchise.facebook_url as string | null) ?? null,
    instagram_url: (franchise.instagram_url as string | null) ?? null,
    twitter_url: (franchise.twitter_url as string | null) ?? null,
    linkedin_url: (franchise.linkedin_url as string | null) ?? null,
    youtube_url: (franchise.youtube_url as string | null) ?? null,
    tiktok_url: (franchise.tiktok_url as string | null) ?? null,
    google_reviews_embed: (franchise.google_reviews_embed as string | null) ?? null,
    show_google_reviews: (franchise.show_google_reviews as boolean) ?? false,
    seo_title: (franchise.seo_title as string | null) ?? null,
    seo_meta_description: (franchise.seo_meta_description as string | null) ?? null,
  })

  function set<K extends keyof FormData>(field: K, value: FormData[K]) {
    setData(prev => ({ ...prev, [field]: value }))
  }

  function str(field: keyof FormData) {
    return (data[field] as string | null) ?? ''
  }

  async function handleSave() {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('franchises')
        .update(data)
        .eq('id', franchise.id)
      if (error) throw error
      toast.success('Listing saved!')
      router.refresh()
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* 1. Listing Plan & Settings */}
      <SectionCard title="Listing Plan & Settings">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Listing Plan</span>
          <Badge className="bg-brand-gold text-brand-navy capitalize">
            {(franchise.listing_plan as string) || 'Standard'}
          </Badge>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <Switch
            id="is_featured"
            checked={data.is_featured}
            onCheckedChange={v => set('is_featured', v)}
          />
          <div>
            <Label htmlFor="is_featured">Featured Franchise</Label>
            <p className="text-xs text-gray-400">Show in top directory section</p>
          </div>
        </div>
      </SectionCard>

      {/* 2. My Company Brand */}
      <SectionCard title="My Company Brand" description="Public listing pages for this franchise.">
        <div className="flex items-center gap-4 mb-2">
          {franchise.logo_url && (
            <img
              src={franchise.logo_url as string}
              alt={franchise.name}
              className="h-12 w-12 object-contain rounded border"
            />
          )}
          <div>
            <p className="font-semibold text-gray-900">{franchise.name}</p>
            <p className="text-xs text-gray-400">/directory/{franchise.slug}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href={`/directory/${franchise.slug}`} target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              View Listing Page
            </Button>
          </Link>
          <Button variant="outline" size="sm" disabled className="opacity-60">
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit Listing Page
            <span className="ml-2 text-xs text-gray-400">(you are here)</span>
          </Button>
        </div>
      </SectionCard>

      {/* 3. Custom Listing Elements */}
      <SectionCard
        title="Custom Listing Elements"
        description="Customize the media and interactive elements on your listing page."
      >
        <Field
          label="Custom Hero Image URL"
          hint="Overrides default header image on the listing page."
        >
          <Input
            value={str('hero_image_url')}
            onChange={e => set('hero_image_url', e.target.value || null)}
            placeholder="https://example.com/hero.jpg"
          />
        </Field>

        <Field label="Intro Video URL (YouTube/Vimeo)">
          <Input
            value={str('intro_video_url')}
            onChange={e => set('intro_video_url', e.target.value || null)}
            placeholder="https://youtu.be/..."
          />
        </Field>

        <Field
          label="Info Pack / Brochure URL"
          hint="Link to downloadable franchise information package or brochure."
        >
          <Input
            value={str('info_pack_url')}
            onChange={e => set('info_pack_url', e.target.value || null)}
            placeholder="https://example.com/brochure.pdf"
          />
        </Field>

        <Field
          label="Apply Now Button URL"
          hint='A direct URL for an "Apply Now" button on the listing page. Takes precedence over embedded application forms.'
        >
          <Input
            value={str('apply_now_url')}
            onChange={e => set('apply_now_url', e.target.value || null)}
            placeholder="https://example.com/apply"
          />
        </Field>

        <Field
          label="Request Info Form Embed Code"
          hint='Embed a custom "Request More Info" form from your CRM (iframe, form HTML, or script). If empty, uses default form.'
        >
          <Textarea
            rows={4}
            value={str('request_info_embed')}
            onChange={e => set('request_info_embed', e.target.value || null)}
            placeholder="<!-- Paste your CRM request info form embed code here -->"
            className="font-mono text-xs"
          />
        </Field>

        <Separator />

        <div>
          <Label className="mb-1 block">Location Gallery Images</Label>
          <p className="text-xs text-gray-400 mb-3">
            Add up to 3 images of your franchise locations, storefront, or operations.
          </p>
          <div className="space-y-3">
            {(['gallery_image_1', 'gallery_image_2', 'gallery_image_3'] as const).map(
              (field, i) => (
                <div key={field}>
                  <Label className="text-xs text-gray-500 mb-1 block">Gallery Image {i + 1}</Label>
                  <Input
                    value={str(field)}
                    onChange={e => set(field, e.target.value || null)}
                    placeholder="https://example.com/location.jpg"
                  />
                </div>
              )
            )}
          </div>
        </div>

        <Field
          label="Calendar Embed Code (GHL)"
          hint="Embed a scheduling calendar directly on the listing page."
        >
          <Textarea
            rows={4}
            value={str('calendar_embed')}
            onChange={e => set('calendar_embed', e.target.value || null)}
            placeholder='<iframe src="https://..." ...></iframe>'
            className="font-mono text-xs"
          />
        </Field>
      </SectionCard>

      {/* 4. Social & Reviews */}
      <SectionCard title="Social & Reviews">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Facebook URL">
            <Input
              value={str('facebook_url')}
              onChange={e => set('facebook_url', e.target.value || null)}
              placeholder="https://facebook.com/yourbrand"
            />
          </Field>
          <Field label="Instagram URL">
            <Input
              value={str('instagram_url')}
              onChange={e => set('instagram_url', e.target.value || null)}
              placeholder="https://instagram.com/yourbrand"
            />
          </Field>
          <Field label="Twitter (X) URL">
            <Input
              value={str('twitter_url')}
              onChange={e => set('twitter_url', e.target.value || null)}
              placeholder="https://twitter.com/yourbrand"
            />
          </Field>
          <Field label="LinkedIn URL">
            <Input
              value={str('linkedin_url')}
              onChange={e => set('linkedin_url', e.target.value || null)}
              placeholder="https://linkedin.com/company/yourbrand"
            />
          </Field>
          <Field label="YouTube URL">
            <Input
              value={str('youtube_url')}
              onChange={e => set('youtube_url', e.target.value || null)}
              placeholder="https://youtube.com/yourbrand"
            />
          </Field>
          <Field label="TikTok URL">
            <Input
              value={str('tiktok_url')}
              onChange={e => set('tiktok_url', e.target.value || null)}
              placeholder="https://tiktok.com/@yourbrand"
            />
          </Field>
        </div>

        <Field
          label="Google Reviews Iframe Code"
          hint="Paste the full iframe/embed code from Elfsight or similar Google Reviews widget service."
        >
          <Textarea
            rows={4}
            value={str('google_reviews_embed')}
            onChange={e => set('google_reviews_embed', e.target.value || null)}
            placeholder="<!-- Elfsight Google Reviews embed code -->"
            className="font-mono text-xs"
          />
        </Field>

        <div className="flex items-center gap-3 pt-1">
          <Switch
            id="show_google_reviews"
            checked={data.show_google_reviews}
            onCheckedChange={v => set('show_google_reviews', v)}
          />
          <div>
            <Label htmlFor="show_google_reviews">Display Google Reviews on Listing Page</Label>
            <p className="text-xs text-gray-400">
              If checked, a Google Reviews section will appear if a Google Reviews embed code is provided.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* 5. SEO Settings */}
      <SectionCard title="SEO Settings">
        <Field label="SEO Title" hint="Appears in browser tab and search results.">
          <Input
            value={str('seo_title')}
            onChange={e => set('seo_title', e.target.value || null)}
            placeholder={`${franchise.name} Franchises`}
          />
        </Field>
        <Field label="SEO Meta Description" hint="A brief summary for search engines.">
          <Textarea
            rows={2}
            value={str('seo_meta_description')}
            onChange={e => set('seo_meta_description', e.target.value || null)}
            placeholder="A brief description for search engines..."
          />
        </Field>
      </SectionCard>

      {/* Save */}
      <div className="flex justify-end pb-8">
        <Button
          className="bg-brand-navy text-brand-gold hover:bg-brand-navy-light px-8"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
