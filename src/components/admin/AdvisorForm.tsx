'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Loader2, Save, ArrowLeft, Plus, X } from 'lucide-react'
import { toast } from 'sonner'

const TITLE_OPTIONS = [
  'Franchise Advisor',
  'Senior Franchise Consultant',
  'Managing Partner',
  'Partner',
]

const US_STATES = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' }, { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' }, { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' }, { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' }, { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' }, { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' }, { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' }, { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' }, { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' }, { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' }, { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' }, { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' }, { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' }, { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' }, { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' }, { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' }, { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' },
]

const TABS = ['Basic Info', 'Media & Links', 'Professional', 'Testimonials'] as const
type Tab = typeof TABS[number]

type AdvisorData = {
  id?: string
  full_name: string
  email: string
  phone: string | null
  advisor_slug: string | null
  advisor_title: string | null
  advisor_bio: string | null
  advisor_image_url: string | null
  advisor_video_url: string | null
  advisor_calendar_url: string | null
  advisor_calendar_embed_code: string | null
  advisor_blog_url: string | null
  advisor_linkedin: string | null
  advisor_personal_quote: string | null
  advisor_testimonials: { quote: string; author: string }[] | null
  advisor_credentials: string[] | null
  advisor_specialties: string[] | null
  advisor_years_experience: number | null
  advisor_city: string | null
  advisor_state: string | null
  advisor_display_order: number | null
  advisor_is_active: boolean
}

const empty: AdvisorData = {
  full_name: '', email: '', phone: null, advisor_slug: null, advisor_title: null,
  advisor_bio: null, advisor_image_url: null, advisor_video_url: null,
  advisor_calendar_url: null, advisor_calendar_embed_code: null,
  advisor_blog_url: null, advisor_linkedin: null, advisor_personal_quote: null,
  advisor_testimonials: [], advisor_credentials: [], advisor_specialties: [],
  advisor_years_experience: null, advisor_city: null, advisor_state: null,
  advisor_display_order: null, advisor_is_active: true,
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function AdvisorForm({ advisor }: { advisor?: any }) {
  const router = useRouter()
  const supabase = createClient()
  const isNew = !advisor?.id
  const [tab, setTab] = useState<Tab>('Basic Info')
  const [saving, setSaving] = useState(false)
  const [showCustomTitle, setShowCustomTitle] = useState(
    advisor?.advisor_title && !TITLE_OPTIONS.includes(advisor.advisor_title)
  )
  const [data, setData] = useState<AdvisorData>(() => {
    if (advisor) {
      return {
        id: advisor.id,
        full_name: advisor.full_name || '',
        email: advisor.email || '',
        phone: advisor.phone || null,
        advisor_slug: advisor.advisor_slug || null,
        advisor_title: advisor.advisor_title || null,
        advisor_bio: advisor.advisor_bio || null,
        advisor_image_url: advisor.advisor_image_url || null,
        advisor_video_url: advisor.advisor_video_url || null,
        advisor_calendar_url: advisor.advisor_calendar_url || null,
        advisor_calendar_embed_code: advisor.advisor_calendar_embed_code || null,
        advisor_blog_url: advisor.advisor_blog_url || null,
        advisor_linkedin: advisor.advisor_linkedin || null,
        advisor_personal_quote: advisor.advisor_personal_quote || null,
        advisor_testimonials: advisor.advisor_testimonials || [],
        advisor_credentials: advisor.advisor_credentials || [],
        advisor_specialties: advisor.advisor_specialties || [],
        advisor_years_experience: advisor.advisor_years_experience || null,
        advisor_city: advisor.advisor_city || null,
        advisor_state: advisor.advisor_state || null,
        advisor_display_order: advisor.advisor_display_order || null,
        advisor_is_active: advisor.advisor_is_active ?? true,
      }
    }
    return empty
  })

  // Dynamic list helpers
  const [newCredential, setNewCredential] = useState('')
  const [newSpecialty, setNewSpecialty] = useState('')
  const [newTestimonial, setNewTestimonial] = useState({ quote: '', author: '' })

  function set(field: keyof AdvisorData, value: unknown) {
    setData(prev => ({ ...prev, [field]: value }))
  }

  function numOrNull(v: string) {
    const n = parseInt(v)
    return isNaN(n) ? null : n
  }

  function handleTitleChange(value: string) {
    if (value === 'custom') {
      setShowCustomTitle(true)
      set('advisor_title', '')
    } else {
      setShowCustomTitle(false)
      set('advisor_title', value)
    }
  }

  function addCredential() {
    if (newCredential.trim()) {
      set('advisor_credentials', [...(data.advisor_credentials || []), newCredential.trim()])
      setNewCredential('')
    }
  }

  function removeCredential(index: number) {
    set('advisor_credentials', (data.advisor_credentials || []).filter((_, i) => i !== index))
  }

  function addSpecialty() {
    if (newSpecialty.trim()) {
      set('advisor_specialties', [...(data.advisor_specialties || []), newSpecialty.trim()])
      setNewSpecialty('')
    }
  }

  function removeSpecialty(index: number) {
    set('advisor_specialties', (data.advisor_specialties || []).filter((_, i) => i !== index))
  }

  function addTestimonial() {
    if (newTestimonial.quote.trim() && newTestimonial.author.trim()) {
      set('advisor_testimonials', [...(data.advisor_testimonials || []), newTestimonial])
      setNewTestimonial({ quote: '', author: '' })
    }
  }

  function removeTestimonial(index: number) {
    set('advisor_testimonials', (data.advisor_testimonials || []).filter((_, i) => i !== index))
  }

  async function handleSave() {
    if (!data.full_name.trim()) { toast.error('Full name is required'); return }
    if (!data.email.trim()) { toast.error('Email is required'); return }

    setSaving(true)
    try {
      // Build the update payload (only advisor-related + name/phone fields)
      const payload = {
        full_name: data.full_name,
        phone: data.phone,
        advisor_slug: data.advisor_slug || slugify(data.full_name),
        advisor_title: data.advisor_title,
        advisor_bio: data.advisor_bio,
        advisor_image_url: data.advisor_image_url,
        advisor_video_url: data.advisor_video_url,
        advisor_calendar_url: data.advisor_calendar_url,
        advisor_calendar_embed_code: data.advisor_calendar_embed_code,
        advisor_blog_url: data.advisor_blog_url,
        advisor_linkedin: data.advisor_linkedin,
        advisor_personal_quote: data.advisor_personal_quote,
        advisor_testimonials: data.advisor_testimonials,
        advisor_credentials: data.advisor_credentials,
        advisor_specialties: data.advisor_specialties,
        advisor_years_experience: data.advisor_years_experience,
        advisor_city: data.advisor_city,
        advisor_state: data.advisor_state,
        advisor_display_order: data.advisor_display_order,
        advisor_is_active: data.advisor_is_active,
      }

      if (isNew) {
        // Call API route to create auth user + profile
        const res = await fetch('/api/admin/create-advisor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.email, ...payload }),
        })
        const result = await res.json()
        if (!res.ok) throw new Error(result.error || 'Failed to create advisor')
        toast.success('Advisor created!')
      } else {
        const { error } = await supabase
          .from('profiles')
          .update(payload)
          .eq('id', advisor!.id)
        if (error) throw error
        toast.success('Advisor saved!')
      }
      router.push('/dashboard/admin/advisors')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tab bar */}
      <div className="flex border-b mb-6">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-brand-navy text-brand-navy'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── BASIC INFO ── */}
      {tab === 'Basic Info' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label>Full Name *</Label>
              <Input
                value={data.full_name}
                onChange={e => {
                  set('full_name', e.target.value)
                  if (isNew) set('advisor_slug', slugify(e.target.value))
                }}
                placeholder="e.g. Lauren Malik"
              />
            </div>
            <div>
              <Label>Email Address *</Label>
              <Input
                type="email"
                value={data.email}
                onChange={e => set('email', e.target.value)}
                placeholder="advisor@example.com"
                disabled={!isNew}
              />
              {!isNew && <p className="text-xs text-gray-400 mt-1">Email cannot be changed after creation.</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label>Title *</Label>
              <select
                value={showCustomTitle ? 'custom' : (data.advisor_title || '')}
                onChange={e => handleTitleChange(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
              >
                <option value="">Select title</option>
                {TITLE_OPTIONS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
                <option value="custom">Custom Title...</option>
              </select>
              {showCustomTitle && (
                <Input
                  className="mt-2"
                  placeholder="Enter custom title"
                  value={data.advisor_title || ''}
                  onChange={e => set('advisor_title', e.target.value)}
                />
              )}
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                value={data.phone || ''}
                onChange={e => set('phone', e.target.value || null)}
                placeholder="+1 555-123-4567"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label>Years of Experience</Label>
              <Input
                type="number"
                value={data.advisor_years_experience ?? ''}
                onChange={e => set('advisor_years_experience', numOrNull(e.target.value))}
                placeholder="e.g. 5"
              />
            </div>
            <div>
              <Label>Display Order</Label>
              <Input
                type="number"
                value={data.advisor_display_order ?? ''}
                onChange={e => set('advisor_display_order', numOrNull(e.target.value))}
                placeholder="e.g. 1"
              />
              <p className="text-xs text-gray-400 mt-1">Lower numbers appear first in the directory.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label>City</Label>
              <Input
                value={data.advisor_city || ''}
                onChange={e => set('advisor_city', e.target.value || null)}
                placeholder="e.g. Dallas"
              />
            </div>
            <div>
              <Label>State</Label>
              <select
                value={data.advisor_state || ''}
                onChange={e => set('advisor_state', e.target.value || null)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
              >
                <option value="">Select state</option>
                {US_STATES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label>URL Slug</Label>
            <Input
              value={data.advisor_slug || ''}
              onChange={e => set('advisor_slug', slugify(e.target.value))}
              placeholder="e.g. lauren-malik"
            />
            <p className="text-xs text-gray-400 mt-1">Used in the URL: /advisors/<strong>{data.advisor_slug || 'slug'}</strong></p>
          </div>

          <div className="flex items-center gap-8 pt-2">
            <div className="flex items-center gap-3">
              <Switch checked={data.advisor_is_active} onCheckedChange={v => set('advisor_is_active', v)} />
              <Label>Active (visible in directory)</Label>
            </div>
          </div>
        </div>
      )}

      {/* ── MEDIA & LINKS ── */}
      {tab === 'Media & Links' && (
        <div className="space-y-5">
          <div>
            <Label>Profile Image URL</Label>
            <Input
              type="url"
              value={data.advisor_image_url || ''}
              onChange={e => set('advisor_image_url', e.target.value || null)}
              placeholder="https://example.com/photo.jpg"
            />
            <p className="text-xs text-gray-400 mt-1">Professional headshot recommended.</p>
          </div>

          <div>
            <Label>Introduction Video URL</Label>
            <Input
              type="url"
              value={data.advisor_video_url || ''}
              onChange={e => set('advisor_video_url', e.target.value || null)}
              placeholder="https://youtube.com/watch?v=..."
            />
            <p className="text-xs text-gray-400 mt-1">MP4 video URL for the advisor&apos;s introduction video.</p>
          </div>

          <div>
            <Label>Calendar URL</Label>
            <Input
              type="url"
              value={data.advisor_calendar_url || ''}
              onChange={e => set('advisor_calendar_url', e.target.value || null)}
              placeholder="https://calendly.com/advisor-name"
            />
            <p className="text-xs text-gray-400 mt-1">Direct booking link (Calendly, GHL, etc.).</p>
          </div>

          <div>
            <Label>Calendar Embed Code (GHL or Calendly)</Label>
            <Textarea
              rows={4}
              value={data.advisor_calendar_embed_code || ''}
              onChange={e => set('advisor_calendar_embed_code', e.target.value || null)}
              placeholder="Paste your calendar embed code here"
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">Supports GHL iframe embeds or Calendly inline widget code.</p>
          </div>

          <div>
            <Label>Blog URL</Label>
            <Input
              type="url"
              value={data.advisor_blog_url || ''}
              onChange={e => set('advisor_blog_url', e.target.value || null)}
              placeholder="https://example.com/blog"
            />
          </div>

          <div>
            <Label>LinkedIn Profile URL</Label>
            <Input
              type="url"
              value={data.advisor_linkedin || ''}
              onChange={e => set('advisor_linkedin', e.target.value || null)}
              placeholder="https://linkedin.com/in/username"
            />
          </div>
        </div>
      )}

      {/* ── PROFESSIONAL ── */}
      {tab === 'Professional' && (
        <div className="space-y-5">
          <div>
            <Label>Professional Biography</Label>
            <Textarea
              rows={6}
              value={data.advisor_bio || ''}
              onChange={e => set('advisor_bio', e.target.value || null)}
              placeholder="Share the advisor's professional background, expertise, and passion for helping franchisees..."
            />
          </div>

          <div>
            <Label>Personal Quote</Label>
            <Textarea
              rows={3}
              value={data.advisor_personal_quote || ''}
              onChange={e => set('advisor_personal_quote', e.target.value || null)}
              placeholder="A short, impactful quote that represents their philosophy..."
            />
          </div>

          <div>
            <Label>Professional Credentials</Label>
            <div className="space-y-2 mt-1">
              {(data.advisor_credentials || []).map((cred, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={cred} disabled className="flex-1 bg-slate-50" />
                  <Button type="button" variant="outline" size="sm" onClick={() => removeCredential(index)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="Add credential (e.g., CFE - Certified Franchise Executive)"
                  value={newCredential}
                  onChange={e => setNewCredential(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCredential() } }}
                />
                <Button type="button" variant="outline" onClick={addCredential}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label>Areas of Expertise</Label>
            <div className="space-y-2 mt-1">
              {(data.advisor_specialties || []).map((spec, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={spec} disabled className="flex-1 bg-slate-50" />
                  <Button type="button" variant="outline" size="sm" onClick={() => removeSpecialty(index)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="Add specialty (e.g., Restaurant Franchises, Multi-Unit Development)"
                  value={newSpecialty}
                  onChange={e => setNewSpecialty(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSpecialty() } }}
                />
                <Button type="button" variant="outline" onClick={addSpecialty}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TESTIMONIALS ── */}
      {tab === 'Testimonials' && (
        <div className="space-y-5">
          <p className="text-gray-600">Add testimonials from satisfied clients to build trust with prospects.</p>

          {(data.advisor_testimonials || []).map((testimonial, index) => (
            <div key={index} className="flex items-start gap-2 p-4 border rounded-lg bg-slate-50">
              <div className="flex-1 space-y-1">
                <p className="text-sm italic text-slate-700">&ldquo;{testimonial.quote}&rdquo;</p>
                <p className="text-sm font-medium text-slate-900">&mdash; {testimonial.author}</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => removeTestimonial(index)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <div className="flex flex-col gap-3 p-4 border border-dashed rounded-lg">
            <Label className="font-medium">Add New Testimonial</Label>
            <Textarea
              placeholder="Testimonial quote from a client..."
              value={newTestimonial.quote}
              onChange={e => setNewTestimonial({ ...newTestimonial, quote: e.target.value })}
              rows={3}
            />
            <Input
              placeholder="Author's Name (e.g., 'John D., Franchise Owner')"
              value={newTestimonial.author}
              onChange={e => setNewTestimonial({ ...newTestimonial, author: e.target.value })}
            />
            <Button type="button" variant="outline" onClick={addTestimonial} className="self-end">
              <Plus className="w-4 h-4 mr-2" />
              Add Testimonial
            </Button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/admin/advisors')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to list
        </Button>
        <div className="flex gap-3">
          {tab !== 'Basic Info' && (
            <Button
              variant="outline"
              onClick={() => setTab(TABS[TABS.indexOf(tab) - 1])}
            >
              Previous
            </Button>
          )}
          {tab !== 'Testimonials' ? (
            <Button
              variant="outline"
              className="border-brand-navy text-brand-navy"
              onClick={() => setTab(TABS[TABS.indexOf(tab) + 1])}
            >
              Next
            </Button>
          ) : null}
          <Button
            className="bg-brand-navy text-brand-gold hover:bg-brand-navy-light"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
            ) : (
              <><Save className="mr-2 h-4 w-4" />{isNew ? 'Create Advisor' : 'Save Changes'}</>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
