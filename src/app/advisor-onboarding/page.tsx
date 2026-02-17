'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Advisor, Profile } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Plus, X, CheckCircle, MapPin } from 'lucide-react'

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

export default function AdvisorOnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [advisorId, setAdvisorId] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCustomTitle, setShowCustomTitle] = useState(false)
  const [newCredential, setNewCredential] = useState('')
  const [newSpecialty, setNewSpecialty] = useState('')
  const [newTestimonial, setNewTestimonial] = useState({ quote: '', author: '' })

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    phone: '',
    city: '',
    state: '',
    years_experience: '',
    linkedin: '',
    bio: '',
    personal_quote: '',
    credentials: [] as string[],
    specialties: [] as string[],
    image_url: '',
    video_url: '',
    calendar_embed_code: '',
    blog_url: '',
    testimonials: [] as { quote: string; author: string }[],
  })

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?redirect=/advisor-onboarding')
        return
      }

      // Check if user has advisor role in profiles
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role, full_name, email')
        .eq('id', user.id)
        .single()

      const profile = profileData as Pick<Profile, 'role' | 'full_name' | 'email'> | null

      if (!profile || profile.role !== 'advisor') {
        router.push('/dashboard')
        return
      }

      if (!user.email) {
        router.push('/dashboard')
        return
      }

      const userEmail = user.email

      // Look up their advisor record by email
      const advisorTable = supabase.from('advisor') as any
      const { data: advisorData } = await advisorTable
        .select('*')
        .eq('email', userEmail)
        .single()

      const advisor = advisorData as Advisor | null

      if (advisor) {
        // If already onboarded (has bio + calendar), go to dashboard
        if (advisor.bio && advisor.calendar_embed_code) {
          router.push('/dashboard/advisor')
          return
        }

        setAdvisorId(advisor.id)
        setUserName(advisor.name?.split(' ')[0] || profile.full_name?.split(' ')[0] || '')
        setFormData(prev => ({
          ...prev,
          name: advisor.name || profile.full_name || '',
          title: advisor.title || '',
          phone: advisor.phone || '',
          city: advisor.city || '',
          state: advisor.state || '',
          years_experience: advisor.years_experience?.toString() || '',
          linkedin: advisor.linkedin || '',
          bio: advisor.bio || '',
          personal_quote: advisor.personal_quote || '',
          credentials: advisor.credentials || [],
          specialties: advisor.specialties || [],
          image_url: advisor.image_url || '',
          video_url: advisor.video_url || '',
          calendar_embed_code: advisor.calendar_embed_code || '',
          blog_url: advisor.blog_url || '',
          testimonials: advisor.testimonials || [],
        }))

        if (advisor.title && !TITLE_OPTIONS.includes(advisor.title)) {
          setShowCustomTitle(true)
        }
      } else {
        // No advisor record yet — they'll create one on submit
        setUserName(profile.full_name?.split(' ')[0] || '')
        setFormData(prev => ({
          ...prev,
          name: profile.full_name || '',
        }))
      }

      setIsLoading(false)
    }
    checkUser()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

    try {
      const payload = {
        name: formData.name,
        title: formData.title || null,
        phone: formData.phone || null,
        city: formData.city || null,
        state: formData.state || null,
        years_experience: formData.years_experience ? parseInt(formData.years_experience) : null,
        linkedin: formData.linkedin || null,
        bio: formData.bio || null,
        personal_quote: formData.personal_quote || null,
        credentials: formData.credentials.length > 0 ? formData.credentials : null,
        specialties: formData.specialties.length > 0 ? formData.specialties : null,
        image_url: formData.image_url || null,
        video_url: formData.video_url || null,
        calendar_embed_code: formData.calendar_embed_code || null,
        blog_url: formData.blog_url || null,
        testimonials: formData.testimonials.length > 0 ? formData.testimonials : null,
        is_active: true,
      }

      if (advisorId) {
        // Update existing advisor record
        const advisorTable = supabase.from('advisor') as any
        const { error } = await advisorTable
          .update(payload)
          .eq('id', advisorId)
        if (error) throw error
      } else {
        // Create new advisor record
        const { data: { user } } = await supabase.auth.getUser()
        const advisorTable = supabase.from('advisor') as any
        const { error } = await advisorTable
          .insert({
            ...payload,
            email: user?.email || null,
            created_by: user?.id || null,
          })
        if (error) throw error
      }

      window.location.href = '/dashboard/advisor'
    } catch (err) {
      console.error('Error saving profile:', err)
      alert('Failed to save profile. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-navy animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="bg-gradient-to-r from-brand-navy to-[#2E3B4D] text-white">
            <CardTitle className="text-3xl">Welcome to AFPA, {userName || 'Advisor'}!</CardTitle>
            <p className="text-brand-cream mt-2">
              Let&apos;s set up your advisor profile to get you started
            </p>
          </CardHeader>
          <CardContent className="p-8">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Step {step} of 4</span>
                <span className="text-sm text-slate-500">{Math.round((step / 4) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-brand-navy h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(step / 4) * 100}%` }}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-slate-900 border-b pb-2">Basic Information</h3>
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
                      <Label>Title *</Label>
                      <select
                        value={showCustomTitle ? 'custom' : formData.title}
                        onChange={e => handleTitleChange(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                        required={!showCustomTitle}
                      >
                        <option value="">Select title</option>
                        {TITLE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                        <option value="custom">Custom Title...</option>
                      </select>
                      {showCustomTitle && (
                        <Input
                          className="mt-2"
                          placeholder="Enter custom title"
                          value={formData.title}
                          onChange={e => handleChange('title', e.target.value)}
                          required
                        />
                      )}
                    </div>
                    <div>
                      <Label>Phone Number *</Label>
                      <Input
                        value={formData.phone}
                        onChange={e => handleChange('phone', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Years of Experience</Label>
                      <Input
                        type="number"
                        value={formData.years_experience}
                        onChange={e => handleChange('years_experience', e.target.value)}
                        placeholder="e.g., 5"
                      />
                    </div>
                    <div>
                      <Label>City *</Label>
                      <Input
                        value={formData.city}
                        onChange={e => handleChange('city', e.target.value)}
                        placeholder="e.g., Dallas"
                        required
                      />
                    </div>
                    <div>
                      <Label>State *</Label>
                      <select
                        value={formData.state}
                        onChange={e => handleChange('state', e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                        required
                      >
                        <option value="">Select state</option>
                        {US_STATES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                      {formData.city && formData.state && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> You&apos;ll appear on the Find an Advisor map
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>LinkedIn Profile URL</Label>
                      <Input
                        type="url"
                        value={formData.linkedin}
                        onChange={e => handleChange('linkedin', e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  </div>
                  <Button type="button" onClick={() => setStep(2)} className="w-full bg-brand-navy hover:bg-brand-navy-light text-brand-gold">
                    Continue
                  </Button>
                </div>
              )}

              {/* Step 2: Professional */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-slate-900 border-b pb-2">Professional Profile</h3>
                  <div>
                    <Label>Professional Biography *</Label>
                    <Textarea
                      value={formData.bio}
                      onChange={e => handleChange('bio', e.target.value)}
                      rows={6}
                      placeholder="Share your professional background, expertise, and what makes you passionate about helping franchisees..."
                      required
                    />
                  </div>
                  <div>
                    <Label>Personal Quote</Label>
                    <Textarea
                      value={formData.personal_quote}
                      onChange={e => handleChange('personal_quote', e.target.value)}
                      placeholder="A short, impactful quote that represents your philosophy..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Professional Credentials</Label>
                    <div className="space-y-2 mt-1">
                      {formData.credentials.map((cred, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input value={cred} disabled className="flex-1 bg-slate-50" />
                          <Button type="button" variant="outline" size="sm" onClick={() => {
                            setFormData(prev => ({ ...prev, credentials: prev.credentials.filter((_, idx) => idx !== i) }))
                          }}><X className="w-4 h-4" /></Button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add credential (e.g., CFE - Certified Franchise Executive)"
                          value={newCredential}
                          onChange={e => setNewCredential(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              if (newCredential.trim()) {
                                setFormData(prev => ({ ...prev, credentials: [...prev.credentials, newCredential.trim()] }))
                                setNewCredential('')
                              }
                            }
                          }}
                        />
                        <Button type="button" variant="outline" onClick={() => {
                          if (newCredential.trim()) {
                            setFormData(prev => ({ ...prev, credentials: [...prev.credentials, newCredential.trim()] }))
                            setNewCredential('')
                          }
                        }}><Plus className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Areas of Expertise</Label>
                    <div className="space-y-2 mt-1">
                      {formData.specialties.map((spec, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input value={spec} disabled className="flex-1 bg-slate-50" />
                          <Button type="button" variant="outline" size="sm" onClick={() => {
                            setFormData(prev => ({ ...prev, specialties: prev.specialties.filter((_, idx) => idx !== i) }))
                          }}><X className="w-4 h-4" /></Button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add specialty (e.g., Restaurant Franchises)"
                          value={newSpecialty}
                          onChange={e => setNewSpecialty(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              if (newSpecialty.trim()) {
                                setFormData(prev => ({ ...prev, specialties: [...prev.specialties, newSpecialty.trim()] }))
                                setNewSpecialty('')
                              }
                            }
                          }}
                        />
                        <Button type="button" variant="outline" onClick={() => {
                          if (newSpecialty.trim()) {
                            setFormData(prev => ({ ...prev, specialties: [...prev.specialties, newSpecialty.trim()] }))
                            setNewSpecialty('')
                          }
                        }}><Plus className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="button" onClick={() => setStep(1)} variant="outline" className="flex-1">Back</Button>
                    <Button type="button" onClick={() => setStep(3)} className="flex-1 bg-brand-navy hover:bg-brand-navy-light text-brand-gold">Continue</Button>
                  </div>
                </div>
              )}

              {/* Step 3: Media */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-slate-900 border-b pb-2">Media & Resources</h3>
                  <div>
                    <Label>Profile Image URL</Label>
                    <Input
                      type="url"
                      value={formData.image_url}
                      onChange={e => handleChange('image_url', e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                    />
                    <p className="text-xs text-slate-500 mt-1">Professional headshot recommended</p>
                  </div>
                  <div>
                    <Label>Introduction Video URL</Label>
                    <Input
                      type="url"
                      value={formData.video_url}
                      onChange={e => handleChange('video_url', e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                  <div>
                    <Label>Blog or Website URL</Label>
                    <Input
                      type="url"
                      value={formData.blog_url}
                      onChange={e => handleChange('blog_url', e.target.value)}
                      placeholder="https://example.com/blog"
                    />
                  </div>
                  <div>
                    <Label>Calendar Booking Embed Code *</Label>
                    <Textarea
                      value={formData.calendar_embed_code}
                      onChange={e => handleChange('calendar_embed_code', e.target.value)}
                      placeholder="Paste your GHL calendar iframe embed code or booking URL"
                      rows={4}
                      required
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      This is how prospects will book calls with you. Paste the full iframe embed code from GHL.
                    </p>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button type="button" onClick={() => setStep(2)} variant="outline" className="flex-1">Back</Button>
                    <Button type="button" onClick={() => setStep(4)} className="flex-1 bg-brand-navy hover:bg-brand-navy-light text-brand-gold">Continue</Button>
                  </div>
                </div>
              )}

              {/* Step 4: Testimonials + Submit */}
              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-slate-900 border-b pb-2">Client Testimonials (Optional)</h3>
                  <p className="text-slate-600">Add testimonials from satisfied clients to build trust with prospects</p>

                  {formData.testimonials.map((t, i) => (
                    <div key={i} className="flex items-start gap-2 p-4 border rounded-lg bg-slate-50">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm italic text-slate-700">&ldquo;{t.quote}&rdquo;</p>
                        <p className="text-sm font-medium text-slate-900">&mdash; {t.author}</p>
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={() => {
                        setFormData(prev => ({ ...prev, testimonials: prev.testimonials.filter((_, idx) => idx !== i) }))
                      }}><X className="w-4 h-4" /></Button>
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
                    <Button type="button" variant="outline" onClick={() => {
                      if (newTestimonial.quote.trim() && newTestimonial.author.trim()) {
                        setFormData(prev => ({ ...prev, testimonials: [...prev.testimonials, newTestimonial] }))
                        setNewTestimonial({ quote: '', author: '' })
                      }
                    }} className="self-end">
                      <Plus className="w-4 h-4 mr-2" /> Add Testimonial
                    </Button>
                  </div>

                  <div className="flex gap-3 pt-6 border-t">
                    <Button type="button" onClick={() => setStep(3)} variant="outline" className="flex-1">Back</Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !formData.name || !formData.title || !formData.phone || !formData.bio || !formData.calendar_embed_code}
                      className="flex-1 bg-brand-navy hover:bg-brand-navy-light text-brand-gold"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Setting up your profile...</>
                      ) : (
                        <><CheckCircle className="w-4 h-4 mr-2" />Complete Setup</>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
