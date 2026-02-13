'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, CheckCircle, Users, Building2, TrendingUp, Shield, Star } from 'lucide-react'

export const metadata = {
  title: 'AFPA Connect UK | Find Your Perfect Franchise',
  description: 'Discover franchise opportunities in the UK. Take our free quiz to find your perfect match.',
}

const stats = [
  { value: '500+', label: 'Franchise Brands' },
  { value: '10K+', label: 'Matches Made' },
  { value: '95%', label: 'Satisfaction Rate' },
  { value: '50+', label: 'Expert Advisors' },
]

const categories = [
  { name: 'Food & Beverage', icon: '🍔', count: 120 },
  { name: 'Home Services', icon: '🏠', count: 85 },
  { name: 'Health & Fitness', icon: '💪', count: 65 },
  { name: 'Automotive', icon: '🚗', count: 45 },
  { name: 'Business Services', icon: '💼', count: 90 },
  { name: 'Education', icon: '📚', count: 55 },
]

export default function HomeUKPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#062234] via-[#202C3D] to-[#062234] text-white py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Find Your Perfect{' '}
                <span className="text-brand-gold">Franchise Match</span>{' '}
                in the UK
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
                Take our free quiz to discover franchise opportunities tailored to your goals, budget, and lifestyle. 
                Join thousands of entrepreneurs who've found their dream business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/quiz">
                  <Button className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light px-8 py-4 text-lg">
                    Take the Quiz
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/directory">
                  <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg">
                    Browse Franchises
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-brand-gold/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-brand-navy/30 rounded-full blur-3xl" />
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold mb-6 text-center">Why Franchise in the UK?</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-brand-gold flex-shrink-0" />
                      <span>Access to proven business models</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-brand-gold flex-shrink-0" />
                      <span>Comprehensive training and support</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-brand-gold flex-shrink-0" />
                      <span>Established brand recognition</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-brand-gold flex-shrink-0" />
                      <span>Networking with fellow franchisees</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-brand-gold mb-2">{stat.value}</div>
                <div className="text-lg text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore Franchise Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Browse hundreds of opportunities across various industries
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Link key={index} href={`/directory?category=${encodeURIComponent(category.name)}`}>
                <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">{category.icon}</div>
                    <h3 className="font-bold text-lg mb-1">{category.name}</h3>
                    <p className="text-gray-500">{category.count} opportunities</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Take our free quiz to get personalized franchise recommendations based on your goals and budget.
          </p>
          <Link href="/quiz">
            <Button className="bg-brand-navy text-brand-gold hover:bg-brand-navy-light px-8 py-4 text-lg">
              Take the Free Quiz
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
