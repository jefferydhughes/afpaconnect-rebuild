'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Check, Building2, Users, Globe, Star, MapPin, Phone, Mail, Calendar } from 'lucide-react'

export const metadata = {
  title: 'Leadership Team | AFPA Connect',
  description: 'Meet the leadership team behind AFPA Connect.',
}

const team = [
  {
    name: 'John Smith',
    role: 'CEO & Founder',
    bio: 'With over 20 years in franchise development, John has helped thousands of entrepreneurs find their dream businesses.',
    image: '/team/john-smith.jpg'
  },
  {
    name: 'Sarah Johnson',
    role: 'Chief Operations Officer',
    bio: 'Sarah brings 15 years of operational expertise to help streamline our franchise matching process.',
    image: '/team/sarah-johnson.jpg'
  },
  {
    name: 'Michael Chen',
    role: 'VP of Technology',
    bio: 'Michael leads our AI and matching technology, bringing innovation to franchise discovery.',
    image: '/team/michael-chen.jpg'
  },
  {
    name: 'Emily Williams',
    role: 'Director of Franchise Relations',
    bio: 'Emily manages relationships with our network of franchisors and franchise advisors.',
    image: '/team/emily-williams.jpg'
  },
  {
    name: 'David Brown',
    role: 'Director of Client Success',
    bio: 'David ensures every client receives personalized support throughout their franchise journey.',
    image: '/team/david-brown.jpg'
  },
  {
    name: 'Jennifer Martinez',
    role: 'Head of Marketing',
    bio: 'Jennifer leads our marketing efforts to connect entrepreneurs with franchise opportunities.',
    image: '/team/jennifer-martinez.jpg'
  }
]

export default function LeadershipTeamPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-brand-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Our Leadership Team</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Meet the experts dedicated to helping you find your perfect franchise opportunity.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Mission */}
        <section className="mb-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600">
              We're dedicated to making franchise ownership accessible to everyone. Our team combines decades of experience in franchising, technology, and customer service to create the most effective franchise matching platform in the industry.
            </p>
          </div>
        </section>

        {/* Team */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="bg-white border-0 shadow-lg overflow-hidden">
                <div className="h-64 bg-gradient-to-br from-brand-navy to-brand-navy-light flex items-center justify-center">
                  <Users className="h-24 w-24 text-white/30" />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <Badge className="mb-3 bg-brand-cream text-brand-navy">{member.role}</Badge>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="mb-16 bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-8 text-center">Our Values</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-brand-navy" />
              </div>
              <h3 className="font-bold mb-2">Integrity</h3>
              <p className="text-sm text-gray-600">We operate with transparency and honesty in everything we do.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-brand-navy" />
              </div>
              <h3 className="font-bold mb-2">Excellence</h3>
              <p className="text-sm text-gray-600">We strive for excellence in every interaction and service.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-brand-navy" />
              </div>
              <h3 className="font-bold mb-2">Client Focus</h3>
              <p className="text-sm text-gray-600">Our clients' success is our top priority.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-brand-navy" />
              </div>
              <h3 className="font-bold mb-2">Innovation</h3>
              <p className="text-sm text-gray-600">We continuously innovate to improve our services.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Work with Our Team?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Get in touch with our experienced team to start your franchise journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quiz">
              <Badge className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light px-8 py-3 text-lg">
                Take the Quiz
              </Badge>
            </Link>
            <Link href="/contact">
              <Badge className="bg-brand-navy text-white hover:bg-brand-navy-light px-8 py-3 text-lg">
                Contact Us
              </Badge>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
