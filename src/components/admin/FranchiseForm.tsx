'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { FRANCHISE_CATEGORIES, toCategorySlug } from '@/lib/franchise-categories'

const TABS = ['Basic Info', 'Financial', 'Ops & Matching', 'Listing Page'] as const
type Tab = typeof TABS[number]

type FranchiseRow = {
  id?: string
  name: string
  slug: string
  category: string
  description: string | null
  full_description: string | null
  logo_url: string | null
  website_url: string | null
  initial_investment_min: number | null
  initial_investment_max: number | null
  franchise_fee: number | null
  royalty_fee_percentage: number | null
  marketing_fee_percentage: number | null
  net_worth_required: number | null
  business_model: string | null
  time_commitment: string | null
  experience_required: boolean
  training_duration_weeks: number | null
  support_level: string | null
  total_locations: number | null
  usa_locations: number | null
  established_year: number | null
  growth_potential: string | null
  fdd_url: string | null
  fdd_summary: string | null
  is_featured: boolean
  is_active: boolean
  broker_email: string | null
  listing_plan: string | null
}

const empty: FranchiseRow = {
  name: '', slug: '', category: '', description: null, full_description: null,
  logo_url: null, website_url: null, initial_investment_min: null,
  initial_investment_max: null, franchise_fee: null, royalty_fee_percentage: null,
  marketing_fee_percentage: null, net_worth_required: null,
  business_model: null, time_commitment: null, experience_required: false,
  training_duration_weeks: null, support_level: null, total_locations: null,
  usa_locations: null, established_year: null, growth_potential: null,
  fdd_url: null, fdd_summary: null, is_featured: false, is_active: true, broker_email: null,
  listing_plan: 'standard',
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function FranchiseForm({ franchise }: { franchise?: FranchiseRow }) {
  const router = useRouter()
  const isNew = !franchise?.id
  const [tab, setTab] = useState<Tab>('Basic Info')
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<FranchiseRow>(franchise ?? empty)
  const [addingCategory, setAddingCategory] = useState(false)
  const [newCategoryInput, setNewCategoryInput] = useState('')

  function set(field: keyof FranchiseRow, value: unknown) {
    setData(prev => ({ ...prev, [field]: value }))
  }

  function numOrNull(v: string) {
    const n = parseFloat(v)
    return isNaN(n) ? null : n
  }

  async function handleSave() {
    if (!data.name.trim()) { toast.error('Franchise name is required'); return }
    if (!data.category) { toast.error('Category is required'); return }
    if (!data.slug.trim()) { toast.error('Slug is required'); return }

    setSaving(true)
    try {
      if (isNew) {
        const res = await fetch('/api/admin/franchises', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        const result = await res.json()
        if (!res.ok) throw new Error(result.error || 'Failed to create franchise')
        toast.success('Franchise created! Redirecting to edit page…')
        // Redirect to the new franchise's edit page so it's immediately accessible
        router.push(`/dashboard/admin/franchises/${result.id}?created=1`)
        router.refresh()
      } else {
        const res = await fetch(`/api/admin/franchises?id=${franchise!.id!}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        const result = await res.json()
        if (!res.ok) throw new Error(result.error || 'Failed to save')
        toast.success('Franchise saved!')
        router.refresh()
      }
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
              <Label>Franchise Name *</Label>
              <Input
                value={data.name}
                onChange={e => {
                  set('name', e.target.value)
                  if (isNew) set('slug', slugify(e.target.value))
                }}
                placeholder="e.g. Subway"
              />
            </div>
            <div>
              <Label>URL Slug *</Label>
              <Input
                value={data.slug}
                onChange={e => set('slug', slugify(e.target.value))}
                placeholder="e.g. subway"
              />
              <p className="text-xs text-gray-400 mt-1">Used in the URL: /directory/<strong>{data.slug || 'slug'}</strong></p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label>Category *</Label>
              {addingCategory ? (
                <div className="flex gap-2 items-center">
                  <Input
                    autoFocus
                    placeholder="e.g. Pet Care"
                    value={newCategoryInput}
                    onChange={e => setNewCategoryInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const slug = toCategorySlug(newCategoryInput)
                        if (slug) { set('category', slug); setAddingCategory(false); setNewCategoryInput('') }
                      }
                      if (e.key === 'Escape') { setAddingCategory(false); setNewCategoryInput('') }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      const slug = toCategorySlug(newCategoryInput)
                      if (slug) { set('category', slug); setAddingCategory(false); setNewCategoryInput('') }
                    }}
                    className="shrink-0 bg-brand-navy text-brand-gold"
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => { setAddingCategory(false); setNewCategoryInput('') }}
                    className="shrink-0"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <select
                  value={data.category}
                  onChange={e => {
                    if (e.target.value === '__add_new__') {
                      setAddingCategory(true)
                    } else {
                      set('category', e.target.value)
                    }
                  }}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                >
                  <option value="">Select category</option>
                  {FRANCHISE_CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                  {/* Show current value if it's a custom slug not in the list */}
                  {data.category && !FRANCHISE_CATEGORIES.find(c => c.value === data.category) && (
                    <option value={data.category}>
                      {data.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  )}
                  <option value="__add_new__">＋ Add new category…</option>
                </select>
              )}
            </div>
            <div>
              <Label>Established Year</Label>
              <Input
                type="number"
                value={data.established_year ?? ''}
                onChange={e => set('established_year', numOrNull(e.target.value))}
                placeholder="e.g. 1965"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label>Website URL</Label>
              <Input
                value={data.website_url ?? ''}
                onChange={e => set('website_url', e.target.value || null)}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label>Logo URL</Label>
              <Input
                value={data.logo_url ?? ''}
                onChange={e => set('logo_url', e.target.value || null)}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>

          <div>
            <Label>Short Description / Tagline</Label>
            <Textarea
              rows={2}
              value={data.description ?? ''}
              onChange={e => set('description', e.target.value || null)}
              placeholder="A concise 1-2 sentence summary of the franchise."
            />
          </div>

          <div>
            <Label>Advisor / Broker Email</Label>
            <Input
              type="email"
              value={data.broker_email ?? ''}
              onChange={e => set('broker_email', e.target.value || null)}
              placeholder="advisor@example.com"
            />
            <p className="text-xs text-gray-400 mt-1">Advisor linked to this franchise listing.</p>
          </div>

          <div className="flex items-center gap-8 pt-2">
            <div className="flex items-center gap-3">
              <Switch checked={data.is_active} onCheckedChange={v => set('is_active', v)} />
              <Label>Active (visible in directory)</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={data.is_featured} onCheckedChange={v => set('is_featured', v)} />
              <Label>Featured listing</Label>
            </div>
          </div>
        </div>
      )}

      {/* ── FINANCIAL ── */}
      {tab === 'Financial' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label>Min Total Investment ($)</Label>
              <Input
                type="number"
                value={data.initial_investment_min ?? ''}
                onChange={e => set('initial_investment_min', numOrNull(e.target.value))}
                placeholder="e.g. 50000"
              />
            </div>
            <div>
              <Label>Max Total Investment ($)</Label>
              <Input
                type="number"
                value={data.initial_investment_max ?? ''}
                onChange={e => set('initial_investment_max', numOrNull(e.target.value))}
                placeholder="e.g. 250000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <Label>Franchise Fee ($)</Label>
              <Input
                type="number"
                value={data.franchise_fee ?? ''}
                onChange={e => set('franchise_fee', numOrNull(e.target.value))}
                placeholder="e.g. 35000"
              />
            </div>
            <div>
              <Label>Royalty Fee (%)</Label>
              <Input
                type="number"
                value={data.royalty_fee_percentage ?? ''}
                onChange={e => set('royalty_fee_percentage', numOrNull(e.target.value))}
                placeholder="e.g. 6"
              />
            </div>
            <div>
              <Label>Marketing Fee (%)</Label>
              <Input
                type="number"
                value={data.marketing_fee_percentage ?? ''}
                onChange={e => set('marketing_fee_percentage', numOrNull(e.target.value))}
                placeholder="e.g. 2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label>Net Worth Required ($)</Label>
              <Input
                type="number"
                value={data.net_worth_required ?? ''}
                onChange={e => set('net_worth_required', numOrNull(e.target.value))}
                placeholder="e.g. 250000"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── OPS & MATCHING ── */}
      {tab === 'Ops & Matching' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <Label>Business Model</Label>
              <select
                value={data.business_model ?? ''}
                onChange={e => set('business_model', e.target.value || null)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
              >
                <option value="">Select...</option>
                <option value="storefront">Storefront</option>
                <option value="mobile">Mobile</option>
                <option value="home_based">Home Based</option>
                <option value="kiosk">Kiosk</option>
                <option value="online">Online</option>
              </select>
            </div>
            <div>
              <Label>Time Commitment</Label>
              <select
                value={data.time_commitment ?? ''}
                onChange={e => set('time_commitment', e.target.value || null)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
              >
                <option value="">Select...</option>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="passive">Passive / Semi-Absentee</option>
              </select>
            </div>
            <div>
              <Label>Support Level</Label>
              <select
                value={data.support_level ?? ''}
                onChange={e => set('support_level', e.target.value || null)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
              >
                <option value="">Select...</option>
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <Label>Training Duration (weeks)</Label>
              <Input
                type="number"
                value={data.training_duration_weeks ?? ''}
                onChange={e => set('training_duration_weeks', numOrNull(e.target.value))}
                placeholder="e.g. 4"
              />
            </div>
            <div>
              <Label>Total Locations</Label>
              <Input
                type="number"
                value={data.total_locations ?? ''}
                onChange={e => set('total_locations', numOrNull(e.target.value))}
                placeholder="e.g. 500"
              />
            </div>
            <div>
              <Label>USA Locations</Label>
              <Input
                type="number"
                value={data.usa_locations ?? ''}
                onChange={e => set('usa_locations', numOrNull(e.target.value))}
                placeholder="e.g. 480"
              />
            </div>
          </div>

          <div>
            <Label>Growth Potential</Label>
            <select
              value={data.growth_potential ?? ''}
              onChange={e => set('growth_potential', e.target.value || null)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
            >
              <option value="">Select...</option>
              <option value="emerging_brand">Emerging Brand</option>
              <option value="high_growth">High Growth</option>
              <option value="stable_mature">Stable / Mature</option>
              <option value="market_leader">Market Leader</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Switch
              checked={data.experience_required}
              onCheckedChange={v => set('experience_required', v)}
            />
            <Label>Prior industry experience required</Label>
          </div>
        </div>
      )}

      {/* ── LISTING PAGE ── */}
      {tab === 'Listing Page' && (
        <div className="space-y-5">
          <div>
            <Label>Listing Plan</Label>
            <select
              value={data.listing_plan ?? 'standard'}
              onChange={e => set('listing_plan', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
            >
              <option value="standard">Standard (directory card only)</option>
              <option value="premium">Premium (full expanded page)</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Premium unlocks the expanded listing page with hero image, video, gallery, social links, and reviews. The franchisor can fill these in from their dashboard.
            </p>
          </div>

          <div>
            <Label>Full Detailed Description</Label>
            <p className="text-xs text-gray-400 mb-1">Supports Markdown. This is shown on the franchise detail page.</p>
            <Textarea
              rows={10}
              value={data.full_description ?? ''}
              onChange={e => set('full_description', e.target.value || null)}
              placeholder="Full description of the franchise opportunity. Supports **Markdown**."
              className="font-mono text-sm"
            />
          </div>

          <div>
            <Label>FDD URL</Label>
            <Input
              value={data.fdd_url ?? ''}
              onChange={e => set('fdd_url', e.target.value || null)}
              placeholder="https://example.com/fdd.pdf"
            />
          </div>

          <div>
            <Label>FDD Summary</Label>
            <Textarea
              rows={4}
              value={data.fdd_summary ?? ''}
              onChange={e => set('fdd_summary', e.target.value || null)}
              placeholder="Key highlights from the FDD..."
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/admin/franchises')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to list
        </Button>
        <div className="flex gap-3">
          {/* Tab navigation */}
          {tab !== 'Basic Info' && (
            <Button
              variant="outline"
              onClick={() => setTab(TABS[TABS.indexOf(tab) - 1])}
            >
              Previous
            </Button>
          )}
          {tab !== 'Listing Page' ? (
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
              <><Save className="mr-2 h-4 w-4" />{isNew ? 'Create Franchise' : 'Save Changes'}</>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
