'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Plus, X, CheckCircle } from 'lucide-react'

const TITLE_OPTIONS = [
  'Franchise Advisor',
  'Senior Franchise Consultant',
  'Managing Partner',
  'Partner',
]

export default function AdvisorSignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    bio: '',
    image_url: '',
    video_url: '',
    calendar_embed_code: '',
    blog_url: '',
    personal_quote: '',
    testimonials: [] as { quote: string; author: string }[],
    credentials: [] as string[],
    specialties: [] as string[],
    linkedin: '',
    years_experience: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showCustomTitle, setShowCustomTitle] = useState(false)
  const [newCredential, setNewCredential] = useState('')
  const [newSpecialty, setNewSpecialty] = useState('')
  const [newTestimonial, setNewTestimonial] = useState({ quote: '', author: '' })

  function handleChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  function handleTitleChange(value: string) {
    if (value === 'custom') {
      setShowCustomTitle(true)
      handleChange('title', '')
    } else {
      setShowCustomTitle(false)
      handleChange('title', value)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const supabase = createClient()
      const advisorApplications = supabase.from('advisor_applications') as any
      const { error } = await advisorApplications.insert({
        first_name: formData.name.split(' ')[0] || formData.name,
        last_name: formData.name.split(' ').slice(1).join(' ') || '',
        email: formData.email,
        phone: formData.phone || null,
        message: JSON.stringify({
          title: formData.title,
          bio: formData.bio,
          image_url: formData.image_url,
          video_url: formData.video_url,
          calendar_embed_code: formData.calendar_embed_code,
          blog_url: formData.blog_url,
          personal_quote: formData.personal_quote,
          testimonials: formData.testimonials,
          credentials: formData.credentials,
          specialties: formData.specialties,
          linkedin: formData.linkedin,
          years_experience: formData.years_experience,
        }),
      })

      if (error) throw error
      setIsSuccess(true)
    } catch (err: any) {
      console.error('Error submitting advisor profile:', err)
      setErrorMessage('An error occurred while submitting your profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-12 text-center">
            <div className="mb-6">
              <CheckCircle className="w-20 h-20 text-green-600 mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Profile Submitted Successfully!</h1>
            <p className="text-lg text-slate-600 mb-6">
              Thank you for submitting your advisor profile. Our team will review your information and contact you shortly.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                <li>Our admin team will review your profile submission</li>
                <li>You&apos;ll receive an email invitation to create your account</li>
                <li>Once approved, your advisor profile will be live on our platform</li>
                <li>You&apos;ll gain access to your personal dashboard and tools</li>
              </ul>
            </div>
            <p className="text-sm text-slate-500 mt-6">
              Questions? Contact us at <a href="mailto:advisors@afpaconnect.com" className="text-blue-600 hover:underline">advisors@afpaconnect.com</a>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="bg-brand-navy text-white">
            <CardTitle className="text-3xl">Join Our Advisor Team</CardTitle>
            <p className="text-brand-cream mt-2">
              Complete your profile to become part of the AFPA advisor network
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                  {errorMessage}
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-900 border-b pb-2">Basic Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={e => handleChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Email Address *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={e => handleChange('email', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Title *</Label>
                    <select
                      value={showCustomTitle ? 'custom' : formData.title}
                      onChange={e => handleTitleChange(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                    >
                      <option value="">Select title</option>
                      {TITLE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                      <option value="custom">Custom Title...</option>
                    </select>
                    {showCustomTitle && (
                      <Input className="mt-2" placeholder="Enter custom title" value={formData.title} onChange={e => handleChange('title', e.target.value)} required />
                    )}
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input value={formData.phone} onChange={e => handleChange('phone', e.target.value)} />
                  </div>
                  <div>
                    <Label>Years of Experience</Label>
                    <Input type="number" value={formData.years_experience} onChange={e => handleChange('years_experience', e.target.value)} />
                  </div>
                  <div>
                    <Label>LinkedIn Profile URL</Label>
                    <Input type="url" value={formData.linkedin} onChange={e => handleChange('linkedin', e.target.value)} placeholder="https://linkedin.com/in/username" />
                  </div>
                </div>
              </div>

              {/* Media & Resources */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-900 border-b pb-2">Media & Resources</h3>
                <div>
                  <Label>Profile Image URL</Label>
                  <Input type="url" value={formData.image_url} onChange={e => handleChange('image_url', e.target.value)} placeholder="https://example.com/photo.jpg" />
                </div>
                <div>
                  <Label>Introduction Video URL</Label>
                  <Input type="url" value={formData.video_url} onChange={e => handleChange('video_url', e.target.value)} placeholder="https://example.com/video.mp4" />
                  <p className="text-xs text-slate-500 mt-1">MP4 video URL for your introduction video</p>
                </div>
                <div>
                  <Label>Blog URL</Label>
                  <Input type="url" value={formData.blog_url} onChange={e => handleChange('blog_url', e.target.value)} placeholder="https://example.com/blog" />
                </div>
                <div>
                  <Label>Calendar Embed Code (GHL or Calendly)</Label>
                  <Textarea
                    value={formData.calendar_embed_code}
                    onChange={e => handleChange('calendar_embed_code', e.target.value)}
                    placeholder="Paste your calendar embed code here"
                    rows={4}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1">Supports GHL iframe embeds or Calendly inline widget code</p>
                </div>
              </div>

              {/* Professional */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-900 border-b pb-2">Professional Information</h3>
                <div>
                  <Label>Professional Biography</Label>
                  <Textarea value={formData.bio} onChange={e => handleChange('bio', e.target.value)} rows={4} placeholder="Tell us about your professional background..." />
                </div>
                <div>
                  <Label>Personal Quote</Label>
                  <Textarea value={formData.personal_quote} onChange={e => handleChange('personal_quote', e.target.value)} placeholder="A short, impactful quote..." rows={3} />
                </div>
              </div>

              {/* Credentials */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-900 border-b pb-2">Professional Credentials</h3>
                <div className="space-y-2">
                  {formData.credentials.map((cred, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input value={cred} disabled className="flex-1" />
                      <Button type="button" variant="outline" size="sm" onClick={() => setFormData(prev => ({ ...prev, credentials: prev.credentials.filter((_, idx) => idx !== i) }))}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add credential (e.g., CFE - Certified Franchise Executive)"
                      value={newCredential}
                      onChange={e => setNewCredential(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') { e.preventDefault(); if (newCredential.trim()) { setFormData(prev => ({ ...prev, credentials: [...prev.credentials, newCredential.trim()] })); setNewCredential('') } }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={() => { if (newCredential.trim()) { setFormData(prev => ({ ...prev, credentials: [...prev.credentials, newCredential.trim()] })); setNewCredential('') } }}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Specialties */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-900 border-b pb-2">Areas of Expertise</h3>
                <div className="space-y-2">
                  {formData.specialties.map((spec, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input value={spec} disabled className="flex-1" />
                      <Button type="button" variant="outline" size="sm" onClick={() => setFormData(prev => ({ ...prev, specialties: prev.specialties.filter((_, idx) => idx !== i) }))}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add specialty (e.g., Restaurant Franchises)"
                      value={newSpecialty}
                      onChange={e => setNewSpecialty(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') { e.preventDefault(); if (newSpecialty.trim()) { setFormData(prev => ({ ...prev, specialties: [...prev.specialties, newSpecialty.trim()] })); setNewSpecialty('') } }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={() => { if (newSpecialty.trim()) { setFormData(prev => ({ ...prev, specialties: [...prev.specialties, newSpecialty.trim()] })); setNewSpecialty('') } }}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Testimonials */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-900 border-b pb-2">Client Testimonials</h3>
                <div className="space-y-2">
                  {formData.testimonials.map((t, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 border rounded-md bg-slate-50">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm italic">&ldquo;{t.quote}&rdquo;</p>
                        <p className="text-sm font-medium">&mdash; {t.author}</p>
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={() => setFormData(prev => ({ ...prev, testimonials: prev.testimonials.filter((_, idx) => idx !== i) }))}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex flex-col gap-2 p-3 border border-dashed rounded-md">
                    <Label className="font-medium">Add New Testimonial</Label>
                    <Textarea placeholder="Testimonial quote..." value={newTestimonial.quote} onChange={e => setNewTestimonial({ ...newTestimonial, quote: e.target.value })} rows={3} />
                    <Input placeholder="Author's Name" value={newTestimonial.author} onChange={e => setNewTestimonial({ ...newTestimonial, author: e.target.value })} />
                    <Button type="button" variant="outline" onClick={() => {
                      if (newTestimonial.quote.trim() && newTestimonial.author.trim()) {
                        setFormData(prev => ({ ...prev, testimonials: [...prev.testimonials, newTestimonial] }))
                        setNewTestimonial({ quote: '', author: '' })
                      }
                    }} className="self-end">
                      <Plus className="w-4 h-4 mr-2" /> Add Testimonial
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="submit" disabled={isSubmitting} className="bg-brand-navy hover:bg-brand-navy-light text-brand-gold px-8">
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
                  ) : 'Submit Profile'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
