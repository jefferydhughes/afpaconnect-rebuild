'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Check, Building2, Users, FileText, Scale, Briefcase, GraduationCap, Heart, Shield, Globe, Star, MapPin, Phone, Mail, Calendar } from 'lucide-react'

const categories = [
  {
    name: 'Getting Started',
    icon: GraduationCap,
    articles: [
      { title: 'What is a Franchise?', slug: 'what-is-franchise' },
      { title: 'How to Evaluate a Franchise', slug: 'evaluate-franchise' },
      { title: 'Franchise vs. Independent Business', slug: 'franchise-vs-independent' },
      { title: 'Understanding FDDs', slug: 'understanding-fdd' }
    ]
  },
  {
    name: 'Financing',
    icon: Building2,
    articles: [
      { title: 'Franchise Financing Options', slug: 'franchise-financing' },
      { title: 'SBA Loans for Franchises', slug: 'sba-loans' },
      { title: 'Using Retirement Funds (ROBS)', slug: 'retirement-funds-robs' },
      { title: 'Franchise Financing Checklist', slug: 'financing-checklist' }
    ]
  },
  {
    name: 'Legal',
    icon: Scale,
    articles: [
      { title: 'Franchise Agreement Basics', slug: 'franchise-agreement' },
      { title: 'What to Look for in an FDD', slug: 'look-for-in-fdd' },
      { title: 'Common Franchise Legal Issues', slug: 'legal-issues' },
      { title: 'State Franchise Laws', slug: 'state-laws' }
    ]
  },
  {
    name: 'Operations',
    icon: Briefcase,
    articles: [
      { title: 'Franchise Operations Manual', slug: 'operations-manual' },
      { title: 'Managing Franchise Employees', slug: 'managing-employees' },
      { title: 'Franchise Marketing Strategies', slug: 'marketing-strategies' },
      { title: 'Franchise Technology Systems', slug: 'technology-systems' }
    ]
  }
]

const featuredGuides = [
  {
    title: 'Complete Guide to Buying a Franchise',
    description: 'Everything you need to know about the franchise buying process, from research to signing.',
    image: '/guides/buy-franchise.jpg',
    category: 'Getting Started',
    readTime: '15 min read'
  },
  {
    title: 'Franchise Due Diligence Checklist',
    description: 'Make sure you\'re asking the right questions before investing.',
    image: '/guides/due-diligence.jpg',
    category: 'Research',
    readTime: '10 min read'
  },
  {
    title: 'Financing Your Franchise',
    description: 'Explore all your funding options and find what works best for you.',
    image: '/guides/financing.jpg',
    category: 'Financing',
    readTime: '12 min read'
  }
]

export default function EducationHubPage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-brand-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Education Hub</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Comprehensive resources to help you make informed decisions about franchise ownership.
          </p>
          
          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search articles, guides, and resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 rounded-full text-gray-900 pr-12"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-gold rounded-full">
                <ArrowRight className="h-5 w-5 text-brand-navy" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Guides */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Guides</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {featuredGuides.map((guide, index) => (
              <Card key={index} className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-brand-navy to-brand-navy-light flex items-center justify-center">
                  <FileText className="h-16 w-16 text-white/50" />
                </div>
                <CardContent className="p-6">
                  <Badge className="mb-3 bg-brand-cream text-brand-navy">{guide.category}</Badge>
                  <h3 className="text-lg font-bold mb-2">{guide.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{guide.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{guide.readTime}</span>
                    <Button variant="ghost" size="sm" className="text-brand-navy">
                      Read More <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Browse by Topic</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-brand-cream rounded-lg">
                      <category.icon className="h-6 w-6 text-brand-navy" />
                    </div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {category.articles.map((article, articleIndex) => (
                      <li key={articleIndex}>
                        <Link href={`/education/${article.slug}`} className="text-gray-600 hover:text-brand-navy text-sm">
                          {article.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-brand-navy mb-4">Need Personalized Guidance?</h2>
          <p className="text-lg text-gray-700 mb-8">
            Our franchise experts can help you navigate the process and find the right opportunity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quiz">
              <Button className="bg-brand-navy text-brand-gold hover:bg-brand-navy-light px-8 py-3">
                Take the Quiz
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/advisors">
              <Button variant="outline" className="border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white px-8 py-3">
                Talk to an Advisor
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
