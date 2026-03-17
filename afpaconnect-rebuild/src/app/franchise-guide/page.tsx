'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight, Check, Building2, DollarSign, Users, TrendingUp, MapPin, Phone, Mail, Star } from 'lucide-react'

const sections = [
  {
    title: 'What is a Franchise?',
    description: 'Understand the fundamentals of franchise ownership',
    icon: Building2,
    content: [
      'A franchise is a business model where you purchase the rights to use an established brand name, products, and operating systems.',
      'You pay an initial franchise fee and ongoing royalties in exchange for training, support, and access to proven business systems.',
      'Franchises offer a lower risk path to business ownership compared to starting from scratch.'
    ]
  },
  {
    title: 'Investment Ranges',
    description: 'Options for every budget',
    icon: DollarSign,
    content: [
      'Home-based franchises: $10,000 - $50,000',
      'Light retail/food: $50,000 - $250,000',
      'Full-service restaurants: $250,000 - $1,500,000',
      'Multi-unit opportunities: $1,000,000+'
    ]
  },
  {
    title: 'Types of Franchises',
    description: 'Find the right fit for your goals',
    icon: Users,
    content: [
      'Product-based franchises (distribution rights)',
      'Business format franchises (complete system)',
      'Conversion franchises (existing business conversion)',
      'Investment franchises (ownership with operators)'
    ]
  },
  {
    title: 'Growth Potential',
    description: 'Build long-term wealth',
    icon: TrendingUp,
    content: [
      'Proven business model reduces failure risk',
      'Brand recognition drives immediate customer traffic',
      'National marketing support amplifies local efforts',
      'Networking opportunities with fellow franchisees'
    ]
  }
]

const steps = [
  {
    number: 1,
    title: 'Self Assessment',
    description: 'Evaluate your skills, financial capacity, and lifestyle goals to determine what franchise type fits you best.'
  },
  {
    number: 2,
    title: 'Research',
    description: 'Explore different industries, attend franchise expos, and gather information about various opportunities.'
  },
  {
    number: 3,
    title: 'Validate',
    description: 'Speak with existing franchisees, review the FDD, and conduct thorough due diligence.'
  },
  {
    number: 4,
    title: 'Apply',
    description: 'Submit your application and complete the franchisor\'s review process.'
  },
  {
    number: 5,
    title: 'Train & Launch',
    description: 'Complete training and prepare for your grand opening with ongoing support.'
  }
]

export default function FranchiseGuidePage() {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Thank you for your interest! We will be in touch soon.')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-brand-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">The Complete Franchise Guide</h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
            Everything you need to know about owning a franchise, from understanding the basics to making your first investment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quiz">
              <Button className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light px-8 py-3 text-lg">
                Take the Quiz
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/directory">
              <Button variant="outline" className="text-white border-white hover:bg-white/10 px-8 py-3 text-lg">
                Browse Franchises
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* What is a Franchise */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Understanding Franchising</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Franchise ownership is one of the most proven paths to business ownership. Here's what you need to know.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {sections.map((section, index) => (
              <Card key={index} className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-brand-cream rounded-lg">
                      <section.icon className="h-6 w-6 text-brand-navy" />
                    </div>
                    <CardTitle className="text-xl font-bold">{section.title}</CardTitle>
                  </div>
                  <p className="text-gray-600">{section.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2 text-gray-600">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* The Process */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Path to Franchise Ownership</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Follow these steps to find and acquire the right franchise for you.
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
        </section>

        {/* Resources */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Free Resources</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Take advantage of our free tools and resources to start your journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white border-0 shadow-lg text-center p-6">
              <CardContent>
                <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-brand-navy" />
                </div>
                <h3 className="text-xl font-bold mb-2">Franchise Quiz</h3>
                <p className="text-gray-600 mb-4">
                  Take our free quiz to get personalized franchise recommendations based on your goals and budget.
                </p>
                <Link href="/quiz">
                  <Button className="bg-brand-navy text-brand-gold">Start Quiz</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg text-center p-6">
              <CardContent>
                <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-brand-navy" />
                </div>
                <h3 className="text-xl font-bold mb-2">Franchise Directory</h3>
                <p className="text-gray-600 mb-4">
                  Browse our directory of verified franchise opportunities and filter by investment level and category.
                </p>
                <Link href="/directory">
                  <Button className="bg-brand-navy text-brand-gold">Browse Directory</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg text-center p-6">
              <CardContent>
                <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-brand-navy" />
                </div>
                <h3 className="text-xl font-bold mb-2">Talk to an Advisor</h3>
                <p className="text-gray-600 mb-4">
                  Connect with a certified franchise advisor for free guidance on your franchise journey.
                </p>
                <Link href="/advisors">
                  <Button className="bg-brand-navy text-brand-gold">Find Advisor</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <Card className="bg-brand-navy text-white border-0">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Franchise?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of entrepreneurs who found their dream franchise through AFPA Connect.
            </p>
            <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white text-gray-900"
                required
              />
              <Button type="submit" className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light whitespace-nowrap">
                Get Started
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
