'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowRight,
  Check,
  Globe,
  HeartHandshake,
  MapPin,
  TrendingUp,
  Users,
  Loader2,
} from 'lucide-react'

const US_STATES: { code: string; name: string }[] = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
]

const benefits = [
  {
    icon: Users,
    title: 'Qualified Candidates',
    description:
      'Our matching engine connects you with pre-screened prospects who fit your brand.',
  },
  {
    icon: TrendingUp,
    title: 'Faster Growth',
    description:
      'Expand across new markets with a network of advisors actively placing candidates.',
  },
  {
    icon: Globe,
    title: 'Nationwide Reach',
    description:
      'Showcase your brand to prospects in every state where you sell territories.',
  },
  {
    icon: HeartHandshake,
    title: 'High-Touch Support',
    description:
      'A dedicated AFPAConnect rep walks you through onboarding, listing, and lead management.',
  },
]

export default function FranchisorSignupPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    brandName: '',
    brandUrl: '',
    locations: '',
    states: [] as string[],
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleState(code: string) {
    setForm((prev) => ({
      ...prev,
      states: prev.states.includes(code)
        ? prev.states.filter((s) => s !== code)
        : [...prev.states, code],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.brandName.trim() ||
      !form.brandUrl.trim() ||
      !form.locations.trim()
    ) {
      setError('Please fill in all required fields.')
      return
    }

    if (form.states.length === 0) {
      setError('Please select at least one state where you are registered to sell.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/franchisor-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-brand-navy text-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-brand-gold text-sm font-semibold uppercase tracking-wider mb-3">
            For Franchisors
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            List Your Franchise on AFPAConnect
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
            Get in front of qualified franchise candidates and partner with a network of
            advisors placing the right owners into the right brands.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="#connect">
              <Button className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light px-8 py-3 text-lg">
                Connect to Learn More
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Franchisors Choose AFPAConnect
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We help established brands accelerate franchise growth with pre-qualified
              leads, national exposure, and advisor-led placement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((b, i) => (
              <Card key={i} className="bg-white border-0 shadow-lg text-center p-6">
                <CardContent>
                  <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-4">
                    <b.icon className="h-8 w-8 text-brand-navy" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{b.title}</h3>
                  <p className="text-gray-600 text-sm">{b.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Link href="#connect">
              <Button className="bg-brand-navy text-brand-gold hover:bg-brand-navy-light px-8 py-3 text-lg">
                Connect to Learn More
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-brand-navy text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">How Onboarding Works</h2>
            <p className="text-gray-300">A straightforward path from introduction to live listing.</p>
          </div>
          <ol className="grid md:grid-cols-4 gap-6">
            {[
              'Submit the form below with your brand details.',
              'We review and reach out to book a discovery call.',
              'Onboarding & listing package finalized.',
              'Your dashboard goes live — manage leads and applications.',
            ].map((step, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-gold text-brand-navy flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                <span className="text-gray-200">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Application form */}
      <section id="connect" className="py-16 bg-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-white border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Tell Us About Your Brand</CardTitle>
              <p className="text-center text-gray-600 text-sm mt-2">
                Fill out the form and our team will reach out to schedule a call.
              </p>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center py-8">
                  <Check className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Thanks — we got it!</h3>
                  <p className="text-gray-600">
                    Our team will review your brand and reach out within 2 business days to
                    book a discovery call.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="fs-name">Your Name *</Label>
                      <Input
                        id="fs-name"
                        value={form.name}
                        onChange={(e) => set('name', e.target.value)}
                        placeholder="Jane Doe"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="fs-email">Email *</Label>
                      <Input
                        id="fs-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => set('email', e.target.value)}
                        placeholder="you@brand.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="fs-phone">Phone</Label>
                      <Input
                        id="fs-phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => set('phone', e.target.value)}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="fs-brand">Brand Name *</Label>
                      <Input
                        id="fs-brand"
                        value={form.brandName}
                        onChange={(e) => set('brandName', e.target.value)}
                        placeholder="Your franchise brand"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="fs-url">Brand URL *</Label>
                      <Input
                        id="fs-url"
                        type="url"
                        value={form.brandUrl}
                        onChange={(e) => set('brandUrl', e.target.value)}
                        placeholder="https://yourbrand.com"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="fs-locations">Number of Locations *</Label>
                      <Input
                        id="fs-locations"
                        type="number"
                        min={0}
                        value={form.locations}
                        onChange={(e) => set('locations', e.target.value)}
                        placeholder="e.g. 24"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-brand-navy" />
                        States Registered to Sell In *
                      </span>
                    </Label>
                    <p className="text-xs text-gray-500">
                      Select every state where your FDD is registered or exempt.
                      ({form.states.length} selected)
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-64 overflow-y-auto p-3 border rounded-md bg-slate-50">
                      {US_STATES.map((s) => {
                        const checked = form.states.includes(s.code)
                        return (
                          <label
                            key={s.code}
                            className={`flex items-center gap-2 text-sm cursor-pointer rounded px-2 py-1 border ${
                              checked
                                ? 'bg-brand-navy text-white border-brand-navy'
                                : 'bg-white border-slate-200 hover:border-brand-navy'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleState(s.code)}
                              className="sr-only"
                            />
                            <span className="font-semibold">{s.code}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="fs-notes">Anything else we should know?</Label>
                    <Textarea
                      id="fs-notes"
                      value={form.notes}
                      onChange={(e) => set('notes', e.target.value)}
                      rows={4}
                      placeholder="Briefly describe your brand, unit economics, ideal franchisee, or any questions."
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-brand-navy text-brand-gold hover:bg-brand-navy-light"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>
                    ) : (
                      <>Connect to Learn More <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
