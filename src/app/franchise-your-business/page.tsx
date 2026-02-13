'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Building2, DollarSign, TrendingUp, Check, MapPin, Phone, Mail, Globe } from 'lucide-react'

export const metadata = {
  title: 'Franchise Your Business | AFPA Connect',
  description: 'Grow your franchise brand with our comprehensive franchising solutions.',
}

const benefits = [
  {
    icon: TrendingUp,
    title: 'Rapid Growth',
    description: 'Franchising is one of the fastest ways to expand your business nationally.'
  },
  {
    icon: DollarSign,
    title: 'Lower Capital Costs',
    description: 'Grow without the heavy debt that comes with corporate expansion.'
  },
  {
    icon: Building2,
    title: 'Motivated Owners',
    description: 'Franchisees are invested in their success, driving better outcomes.'
  },
  {
    icon: Globe,
    title: 'National Brand',
    description: 'Build a recognizable brand across multiple markets simultaneously.'
  }
]

const steps = [
  {
    number: 1,
    title: 'Discovery Call',
    description: 'We discuss your goals, business model, and determine if franchising is right for you.'
  },
  {
    number: 2,
    title: 'Financial Assessment',
    description: 'We analyze your financials to ensure franchise readiness and determine franchise fees.'
  },
  {
    number: 3,
    title: 'FDD Preparation',
    description: 'Our legal team prepares your Franchise Disclosure Document and agreement.'
  },
  {
    number: 4,
    title: 'Operations Manual',
    description: 'We document your systems and processes for franchisee training.'
  },
  {
    number: 5,
    title: 'Launch & Marketing',
    description: 'We help you launch your franchise program and attract qualified franchisees.'
  }
]

export default function FranchiseYourBusinessPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    employees: '',
    revenue: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Franchise Your Business</h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
            Turn your successful business into a national franchise brand. We handle the complexity so you can focus on growth.
          </p>
          <Link href="#apply">
            <Button className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light px-8 py-3 text-lg">
              Start the Process
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Franchise?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Franchising offers unique advantages for business owners looking to expand.
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

      {/* Is Your Business Ready */}
      <section className="py-16 bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Is Your Business Franchise-Ready?</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Here's what we look for in a strong franchise candidate.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white/10 backdrop-blur">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4 text-brand-gold">Proven Success</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>3+ years of successful operations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>Profitable business model</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>Replicated successfully</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>Documented systems</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4 text-brand-gold">Brand Potential</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>Strong brand recognition</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>Unique value proposition</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>Scalable concept</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>Training capability</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4 text-brand-gold">Financial Strength</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>Minimum $500K liquid capital</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>Net worth of $1M+</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>Access to growth capital</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>Strong credit history</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Process</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We guide you through every step of the franchising journey.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-brand-navy text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-white border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Apply to Franchise</CardTitle>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="text-center py-8">
                  <Check className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Application Submitted!</h3>
                  <p className="text-gray-600">
                    Thank you for your interest. Our team will contact you within 2 business days.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name *</Label>
                      <Input id="company" name="company" value={formData.company} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employees">Number of Employees</Label>
                      <select id="employees" name="employees" value={formData.employees} onChange={handleChange} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                        <option value="">Select...</option>
                        <option value="1-10">1-10</option>
                        <option value="11-50">11-50</option>
                        <option value="51-100">51-100</option>
                        <option value="100+">100+</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="revenue">Annual Revenue</Label>
                      <select id="revenue" name="revenue" value={formData.revenue} onChange={handleChange} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                        <option value="">Select...</option>
                        <option value="under-1m">Under $1M</option>
                        <option value="1m-5m">$1M - $5M</option>
                        <option value="5m-10m">$5M - $10M</option>
                        <option value="10m+">$10M+</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Tell us about your business</Label>
                    <textarea id="message" name="message" value={formData.message} onChange={handleChange} rows={4} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  </div>

                  <Button type="submit" className="w-full bg-brand-navy text-brand-gold" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Questions?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Schedule a free consultation to discuss your franchising goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-brand-navy" />
              <span>franchise@afpaconnect.com</span>
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

function Label({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      {children}
    </label>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    />
  )
}
