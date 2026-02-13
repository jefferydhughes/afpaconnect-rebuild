'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Check, Building2, Users, FileText, Scale, TrendingUp, DollarSign, Star, MapPin, Phone, Mail, Calendar } from 'lucide-react'

export const metadata = {
  title: 'Finance Your Franchise | AFPA Connect',
  description: 'Explore financing options for your franchise investment.',
}

const financingOptions = [
  {
    title: 'SBA Loans',
    description: 'Small Business Administration loans offer favorable terms for franchise financing.',
    icon: Building2,
    minAmount: '$50,000',
    maxAmount: '$5,000,000',
    terms: '7-25 years',
    features: ['Low down payment', 'Competitive rates', 'Government backed']
  },
  {
    title: 'Conventional Bank Loans',
    description: 'Traditional financing from banks and credit unions.',
    icon: DollarSign,
    minAmount: '$25,000',
    maxAmount: '$10,000,000',
    terms: '5-20 years',
    features: ['Flexible terms', 'Established relationships', 'Quick approval']
  },
  {
    title: 'Franchisor Financing',
    description: 'Many franchisors offer in-house financing programs.',
    icon: TrendingUp,
    minAmount: '$10,000',
    maxAmount: '$500,000',
    terms: '3-10 years',
    features: ['Simplified process', 'Flexible credit', 'Partner support']
  },
  {
    title: 'ROBS (Rollovers for Business Startups)',
    description: 'Use your retirement funds without penalties.',
    icon: Users,
    minAmount: '$20,000',
    maxAmount: '$500,000',
    terms: 'N/A',
    features: ['No penalties', 'Keep retirement funds', 'Tax advantages']
  },
  {
    title: 'Home Equity',
    description: 'Leverage your home equity for franchise financing.',
    icon: Building2,
    minAmount: '$25,000',
    maxAmount: '$1,000,000',
    terms: '5-30 years',
    features: ['Lower rates', 'Tax deductibility', 'Large amounts']
  },
  {
    title: 'Alternative Financing',
    description: 'Equipment leasing, invoice factoring, and other options.',
    icon: FileText,
    minAmount: '$5,000',
    maxAmount: '$250,000',
    terms: '1-5 years',
    features: ['Fast approval', 'Flexible terms', 'Less documentation']
  }
]

const tips = [
  'Improve your personal credit score before applying',
  'Prepare detailed business plan and financial projections',
  'Gather all required documentation in advance',
  'Compare offers from multiple lenders',
  'Consider working with a franchise financing specialist',
  'Understand all fees and prepayment penalties'
]

export default function FinanceYourFranchisePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-brand-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Finance Your Franchise</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Explore your financing options and find the best way to fund your franchise investment.
          </p>
          <Link href="/quiz">
            <Button className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light px-8 py-3 text-lg">
              Get Pre-Qualified
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Financing Options */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Financing Options</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              There are many ways to finance your franchise. Explore the options that work best for you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {financingOptions.map((option, index) => (
              <Card key={index} className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-brand-cream rounded-lg">
                      <option.icon className="h-6 w-6 text-brand-navy" />
                    </div>
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                  </div>
                  <p className="text-gray-600 text-sm">{option.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Amount:</span>
                      <span className="font-medium">{option.minAmount} - {option.maxAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Terms:</span>
                      <span className="font-medium">{option.terms}</span>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {option.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="mb-16 bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Tips for Getting Funded</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Calculator CTA */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-brand-navy to-brand-navy-light text-white border-0">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Estimate Your Investment</h2>
              <p className="text-gray-300 mb-6">
                Use our investment calculator to understand the costs involved in franchise ownership.
              </p>
              <Link href="/investment-calculator">
                <Button className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light">
                  Open Calculator
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Our financing specialists can help you explore your options and find the best funding solution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button className="bg-brand-navy text-brand-gold px-8 py-3">
                  Contact Us
                </Button>
              </Link>
              <Link href="/quiz">
                <Button variant="outline" className="px-8 py-3">
                  Take the Quiz
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
