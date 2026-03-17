'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight, Building2, Check, Shield, Users, Globe, Mail, Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const benefits = [
  {
    icon: Users,
    title: 'Unlimited Leads',
    description: 'Access our database of qualified franchise candidates actively looking for opportunities.'
  },
  {
    icon: Building2,
    title: 'Proven System',
    description: 'Use our AI-powered matching technology to make better, faster matches.'
  },
  {
    icon: Shield,
    title: 'Full Support',
    description: 'Get training, marketing materials, and ongoing support from our team.'
  },
  {
    icon: Globe,
    title: 'National Network',
    description: 'Join a community of top-performing franchise advisors across the country.'
  }
]

const requirements = [
  'Valid real estate or business broker license (preferred)',
  'Strong communication and interpersonal skills',
  'Passion for helping entrepreneurs succeed',
  'Self-motivated with ability to work independently',
  'Access to reliable transportation',
  'Clean background check'
]

export default function BecomeAdvisorPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    licenseNumber: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('advisor_applications').insert({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone || null,
        company: formData.company || null,
        license_number: formData.licenseNumber || null,
        message: formData.message || null,
      })
      if (error) throw error
      setIsSubmitted(true)
    } catch (err) {
      console.error('Error submitting application:', err)
      alert('Failed to submit application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-brand-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Become a Franchise Advisor</h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
            Join our network of certified franchise advisors and help entrepreneurs find their dream business.
          </p>
          <Link href="#apply">
            <Button className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light px-8 py-3 text-lg">
              Apply Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Join Our Network?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide everything you need to succeed as a franchise advisor.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="bg-white border-0 shadow-lg text-center p-6">
                <CardContent>
                  <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-8 w-8 text-brand-navy" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-brand-navy py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold text-brand-gold mb-2">500+</div>
              <div className="text-xl">Active Advisors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-brand-gold mb-2">10K+</div>
              <div className="text-xl">Matches Made</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-brand-gold mb-2">95%</div>
              <div className="text-xl">Client Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-brand-gold mb-2">$2B</div>
              <div className="text-xl">Franchise Volume</div>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What We're Looking For</h2>
              <p className="text-lg text-gray-600 mb-8">
                We're seeking experienced professionals who are passionate about helping others achieve their entrepreneurial dreams.
              </p>
              <ul className="space-y-4">
                {requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div id="apply">
              <Card className="bg-white border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">Apply Now</CardTitle>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <Check className="h-16 w-16 text-green-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">Application Submitted!</h3>
                      <p className="text-gray-600">
                        Thank you for your interest. Our team will review your application and contact you within 2 business days.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company">Company Name</Label>
                        <Input
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="licenseNumber">License Number</Label>
                        <Input
                          id="licenseNumber"
                          name="licenseNumber"
                          value={formData.licenseNumber}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Tell us about yourself</Label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows={4}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-brand-navy text-brand-gold"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Have Questions?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Our team is here to answer any questions you have about becoming a franchise advisor.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-brand-navy" />
              <span>advisors@afpaconnect.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-brand-navy" />
              <span>(800) 555-1234</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
