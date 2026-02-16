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
  name: string
  email: string
  phone: string | null
  title: string | null
  bio: string | null
  image_url: string | null
  video_url: string | null
  calendar_embed_code: string | null
  blog_url: string | null
  linkedin: string | null
  personal_quote: string | null
  testimonials: { quote: string; author: string }[] | null
  credentials: string[] | null
  specialties: string[] | null
  years_experience: number | null
  city: string | null
  state: string | null
  display_order: number | null
  is_active: boolean
  is_leadership: boolean
  latitude: number | null
  longitude: number | null
}

const empty: AdvisorData = {
  name: '', email: '', phone: null, title: null,
  bio: null, image_url: null, video_url: null,
  calendar_embed_code: null, blog_url: null, linkedin: null,
  personal_quote: null, testimonials: [], credentials: [],
  specialties: [], years_experience: null, city: null,
  state: null, display_order: null, is_active: true,
  is_leadership: false, latitude: null, longitude: null,
}

export default function AdvisorForm({ advisor }: { advisor?: any }) {
  const router = useRouter()
  const supabase = createClient()
  const isNew = !advisor?.id
  const [tab, setTab] = useState<Tab>('Basic Info')
  const [saving, setSaving] = useState(false)
  const [showCustomTitle, setShowCustomTitle] = useState(
    advisor?.title && !TITLE_OPTIONS.includes(advisor.title)
  )
  const [data, setData] = useState<AdvisorData>(() => {
    if (advisor) {
      return {
        id: advisor.id,
        name: advisor.name || '',
        email: advisor.email || '',
        phone: advisor.phone || null,
        title: advisor.title || null,
        bio: advisor.bio || null,
        image_url: advisor.image_url || null,
        video_url: advisor.video_url || null,
        calendar_embed_code: advisor.calendar_embed_code || null,
        blog_url: advisor.blog_url || null,
        linkedin: advisor.linkedin || null,
        personal_quote: advisor.personal_quote || null,
        testimonials: advisor.testimonials || [],
        credentials: advisor.credentials || [],
        specialties: advisor.specialties || [],
        years_experience: advisor.years_experience || null,
        city: advisor.city || null,
        state: advisor.state || null,
        display_order: advisor.display_order || null,
        is_active: advisor.is_active ?? true,
        is_leadership: advisor.is_leadership ?? false,
        latitude: advisor.latitude || null,
        longitude: advisor.longitude || null,
      }
    }
    return empty
  })

  const [newCredential, setNewCredential] = useState('')
  const [newSpecialty, setNewSpecialty] = useState('')
  const [newTestimonial, setNewTestimonial] = useState({ quote: '', author: '' })

  function set(field: keyof AdvisorData, value: unknown) {
    setData(prev => ({ ...prev, [field]: value }))
  }

  function numOrNull(v: string) {
    const n = parseFloat(v)
    return isNaN(n) ? null : n
  }

  function handleTitleChange(value: string) {
    if (value === 'custom') {
      setShowCustomTitle(true)
      set('title', '')
    } else {
      setShowCustomTitle(false)
      set('title', value)
    }
  }

  function addCredential() {
    if (newCredential.trim()) {
      set('credentials', [...(data.credentials || []), newCredential.trim()])
      setNewCredential('')
    }
  }

  function removeCredential(index: number) {
    set('credentials', (data.credentials || []).filter((_, i) => i !== index))
  }

  function addSpecialty() {
    if (newSpecialty.trim()) {
      set('specialties', [...(data.specialties || []), newSpecialty.trim()])
      setNewSpecialty('')
    }
  }

  function removeSpecialty(index: number) {
    set('specialties', (data.specialties || []).filter((_, i) => i !== index))
  }

  function addTestimonial() {
    if (newTestimonial.quote.trim() && newTestimonial.author.trim()) {
      set('testimonials', [...(data.testimonials || []), newTestimonial])
      setNewTestimonial({ quote: '', author: '' })
    }
  }

  function removeTestimonial(index: number) {
    set('testimonials', (data.testimonials || []).filter((_, i) => i !== index))
  }

  async function handleSave() {
    if (!data.name.trim()) { toast.error('Name is required'); return }
    if (!data.email.trim()) { toast.error('Email is required'); return }

    setSaving(true)
    try {
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        title: data.title,
        bio: data.bio,
        image_url: data.image_url,
        video_url: data.video_url,
        calendar_embed_code: data.calendar_embed_code,
        blog_url: data.blog_url,
        linkedin: data.linkedin,
        personal_quote: data.personal_quote,
        testimonials: data.testimonials,
        credentials: data.credentials,
        specialties: data.specialties,
        years_experience: data.years_experience,
        city: data.city,
        state: data.state,
        display_order: data.display_order,
        is_active: data.is_active,
        is_leadership: data.is_leadership,
        latitude: data.latitude,
        longitude: data.longitude,
      }

      if (isNew) {
        const { error } = await supabase.from('advisor').insert(payload)
        if (error) throw error
        toast.success('Advisor created!')
      } else {
        const { error } = await supabase
          .from('advisor')
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
                value={data.name}
                onChange={e => set('name', e.target.value)}
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
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label>Title *</Label>
              <select
                value={showCustomTitle ? 'custom' : (data.title || '')}
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
                  value={data.title || ''}
                  onChange={e => set('title', e.target.value)}
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
                value={data.years_experience ?? ''}
                onChange={e => set('years_experience', numOrNull(e.target.value))}
                placeholder="e.g. 5"
              />
            </div>
            <div>
              <Label>Display Order</Label>
              <Input
                type="number"
                value={data.display_order ?? ''}
                onChange={e => set('display_order', numOrNull(e.target.value))}
                placeholder="e.g. 1"
              />
              <p className="text-xs text-gray-400 mt-1">Lower numbers appear first in the directory.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label>City</Label>
              <Input
                value={data.city || ''}
                onChange={e => set('city', e.target.value || null)}
                placeholder="e.g. Dallas"
              />
            </div>
            <div>
              <Label>State</Label>
              <select
                value={data.state || ''}
                onChange={e => set('state', e.target.value || null)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
              >
                <option value="">Select state</option>
                {US_STATES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label>Latitude</Label>
              <Input
                type="number"
                step="any"
                value={data.latitude ?? ''}
                onChange={e => set('latitude', numOrNull(e.target.value))}
                placeholder="e.g. 32.7767"
              />
            </div>
            <div>
              <Label>Longitude</Label>
              <Input
                type="number"
                step="any"
                value={data.longitude ?? ''}
                onChange={e => set('longitude', numOrNull(e.target.value))}
                placeholder="e.g. -96.7970"
              />
            </div>
          </div>

          <div className="flex items-center gap-8 pt-2">
            <div className="flex items-center gap-3">
              <Switch checked={data.is_active} onCheckedChange={v => set('is_active', v)} />
              <Label>Active (visible in directory)</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={data.is_leadership} onCheckedChange={v => set('is_leadership', v)} />
              <Label>Leadership team member</Label>
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
              value={data.image_url || ''}
              onChange={e => set('image_url', e.target.value || null)}
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          <div>
            <Label>Introduction Video URL</Label>
            <Input
              type="url"
              value={data.video_url || ''}
              onChange={e => set('video_url', e.target.value || null)}
              placeholder="https://youtube.com/watch?v=..."
            />
            <p className="text-xs text-gray-400 mt-1">MP4 video URL for the advisor&apos;s introduction video.</p>
          </div>

          <div>
            <Label>Calendar Embed Code (GHL or Calendly)</Label>
            <Textarea
              rows={4}
              value={data.calendar_embed_code || ''}
              onChange={e => set('calendar_embed_code', e.target.value || null)}
              placeholder="Paste your calendar embed code here"
              className="font-mono text-sm"
            />
          </div>

          <div>
            <Label>Blog URL</Label>
            <Input
              type="url"
              value={data.blog_url || ''}
              onChange={e => set('blog_url', e.target.value || null)}
              placeholder="https://example.com/blog"
            />
          </div>

          <div>
            <Label>LinkedIn Profile URL</Label>
            <Input
              type="url"
              value={data.linkedin || ''}
              onChange={e => set('linkedin', e.target.value || null)}
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
              value={data.bio || ''}
              onChange={e => set('bio', e.target.value || null)}
              placeholder="Share the advisor's professional background, expertise, and passion for helping franchisees..."
            />
          </div>

          <div>
            <Label>Personal Quote</Label>
            <Textarea
              rows={3}
              value={data.personal_quote || ''}
              onChange={e => set('personal_quote', e.target.value || null)}
              placeholder="A short, impactful quote that represents their philosophy..."
            />
          </div>

          <div>
            <Label>Professional Credentials</Label>
            <div className="space-y-2 mt-1">
              {(data.credentials || []).map((cred, index) => (
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
              {(data.specialties || []).map((spec, index) => (
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

          {(data.testimonials || []).map((testimonial, index) => (
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
