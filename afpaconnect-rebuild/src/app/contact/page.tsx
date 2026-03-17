'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare,
  Clock,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const form = e.currentTarget
      const formData = new FormData(form)

      const payload = {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        email: formData.get('email') as string,
        phone: (formData.get('phone') as string) || null,
        subject: formData.get('subject') as string,
        message: formData.get('message') as string,
      }

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to send message')
      }

      setIsSubmitted(true)
      toast.success('Message sent! We\'ll get back to you soon.')
    } catch (err) {
      console.error('Contact form error:', err)
      toast.error('Something went wrong. Please try again or email us directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-brand-navy text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-gray-300">
            Have questions? We&apos;re here to help you on your franchise journey.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-brand-cream rounded-lg">
                    <Mail className="h-6 w-6 text-brand-navy" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email Us</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      For general inquiries and support
                    </p>
                    <a 
                      href="mailto:info@afpaconnect.com"
                      className="text-brand-gold hover:underline mt-2 inline-block"
                    >
                      info@afpaconnect.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-brand-cream rounded-lg">
                    <Phone className="h-6 w-6 text-brand-navy" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Call Us</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Mon-Fri, 9am-5pm EST
                    </p>
                    <a 
                      href="tel:+18005551234"
                      className="text-brand-gold hover:underline mt-2 inline-block"
                    >
                      (800) 555-1234
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-brand-cream rounded-lg">
                    <MessageSquare className="h-6 w-6 text-brand-navy" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Talk to an Advisor</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Get personalized franchise guidance
                    </p>
                    <Link 
                      href="/advisors"
                      className="text-brand-gold hover:underline mt-2 inline-block"
                    >
                      Find an advisor →
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-brand-cream border-brand-gold">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-lg">
                    <Clock className="h-6 w-6 text-brand-navy" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-navy">Response Time</h3>
                    <p className="text-gray-700 text-sm mt-1">
                      We typically respond within 24 hours during business days.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send Us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => setIsSubmitted(false)}
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input id="firstName" name="firstName" required placeholder="John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input id="lastName" name="lastName" required placeholder="Smith" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="john@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (Optional)</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="">Select a topic...</option>
                        <option value="general">General Inquiry</option>
                        <option value="franchise">Franchise Information</option>
                        <option value="advisor">Become an Advisor</option>
                        <option value="franchisor">List My Franchise</option>
                        <option value="support">Technical Support</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        placeholder="How can we help you?"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-brand-navy text-brand-gold hover:bg-brand-navy-light"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Link */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Looking for quick answers? Check our frequently asked questions.
          </p>
          <Link href="/faq">
            <Button variant="outline">
              View FAQ
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
