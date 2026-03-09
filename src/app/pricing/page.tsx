import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ButtonProps } from '@/components/ui/button'
import { Check, Star, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Pricing Plans | AFPA Connect',
  description: 'Choose the right advertising plan for your franchise. From free basic listings to premium marketing solutions.',
}

const pricingPlans = [
  {
    name: 'Basic Listing',
    price: 'Free',
    period: 'forever',
    description: 'Goal: Populate directory & drive exposure',
    features: [
      'Franchise Name & Logo',
      'Franchise Category & Tags',
      'Basic Info (years in biz, fees, etc.)',
      'Contact form or "Learn More" link'
    ],
    buttonText: 'Get Started Free',
    buttonVariant: 'outline',
    popular: false
  },
  {
    name: 'Featured Listing',
    price: '$149',
    period: 'per month',
    description: 'Goal: Visibility + qualified leads',
    features: [
      'Everything in Basic, plus:',
      'Top-of-category placement',
      'Custom hero image + banner',
      'Full profile with history, fees, photos',
      'AI Franchise Match inclusion',
      'Social media links',
      'Verified Badge + Reviews section',
      'Email lead notifications + tracking',
      'Access to dashboard with analytics',
      '"Book a Call" CTA with embedded calendar'
    ],
    buttonText: 'Start Featured',
    buttonVariant: 'default',
    popular: true
  },
  {
    name: 'Premium Listing',
    price: '$399',
    period: 'per month',
    description: 'Goal: Full-funnel lead generation engine',
    features: [
      'Everything in Featured, plus:',
      'Fully custom landing page',
      'Native video hosting + integration',
      'Advanced SEO (structured data)',
      'Booking calendar system with timezone',
      'Lead scoring & tagging',
      'Lead CRM dashboard',
      'Custom contact forms + logic',
      'Priority support (Slack)',
      '2 SEO blog posts per month',
      'Featured in monthly newsletter'
    ],
    buttonText: 'Go Premium',
    buttonVariant: 'default',
    popular: false
  }
] as const satisfies ReadonlyArray<{
  name: string
  price: string
  period: string
  description: string
  features: readonly string[]
  buttonText: string
  buttonVariant: NonNullable<ButtonProps['variant']>
  popular: boolean
}>

const advisorPlans = [
  {
    name: 'Advisor Starter',
    price: '$299',
    period: 'per month',
    description: 'Perfect for new franchise advisors',
    features: [
      'Up to 10 franchise listings',
      'Basic advisor profile',
      'Lead capture forms',
      'Contact management',
      'Email integration'
    ],
    buttonText: 'Start Advising',
    buttonVariant: 'outline'
  },
  {
    name: 'Advisor Professional',
    price: '$599',
    period: 'per month',
    description: 'For established franchise advisors',
    features: [
      'Up to 50 franchise listings',
      'Enhanced advisor profile',
      'Advanced lead management',
      'CRM integration',
      'Custom landing pages',
      'Analytics dashboard',
      'Priority placement'
    ],
    buttonText: 'Go Professional',
    buttonVariant: 'default'
  }
] as const satisfies ReadonlyArray<{
  name: string
  price: string
  period: string
  description: string
  features: readonly string[]
  buttonText: string
  buttonVariant: NonNullable<ButtonProps['variant']>
}>

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-brand-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Choose the perfect plan to showcase your franchise opportunity
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Franchisor Plans */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Franchisor Plans</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get your franchise opportunity in front of qualified buyers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow bg-white ${plan.popular ? 'ring-2 ring-brand-gold' : ''}`}>
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-brand-gold text-brand-navy text-center py-2 text-sm font-semibold">
                    <Star className="inline w-4 h-4 mr-1" />
                    Most Popular
                  </div>
                )}
                
                <CardHeader className={`text-center ${plan.popular ? 'pt-12' : 'pt-8'} pb-8`}>
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period !== 'forever' && <span className="text-gray-500 ml-2">/{plan.period}</span>}
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full ${plan.buttonVariant === 'default' ? 'bg-brand-navy text-brand-gold hover:bg-brand-navy-light' : ''}`}
                    variant={plan.buttonVariant}
                    asChild
                  >
                    <Link href={plan.name === 'Basic Listing' ? '/franchise-your-business' : '/contact'}>
                      {plan.buttonText}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Optional Add-Ons */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Optional Add-Ons</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Enhance your listing with these premium services
            </p>
          </div>
          
          <Card className="max-w-4xl mx-auto bg-brand-cream border-brand-gold">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-green-600 text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">Dedicated Franchise Concierge Service</h4>
                      <p className="text-sm text-gray-600">$99/lead. Our team works as an appointment setter.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="text-green-600 text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">Social Media Content Pack</h4>
                      <p className="text-sm text-gray-600">$199/mo — 4 reels + captions</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="text-green-600 text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">Featured Video Interview</h4>
                      <p className="text-sm text-gray-600">$299 one-time</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-green-600 text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">Lead Nurture Campaign Set Up</h4>
                      <p className="text-sm text-gray-600">$499 one-time</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="text-green-600 text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">Custom Sales Funnel + Ad Templates</h4>
                      <p className="text-sm text-gray-600">$699</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="text-green-600 text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">Dedicated Account Manager</h4>
                      <p className="text-sm text-gray-600">Minimum 3-month contract</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Advisor Plans */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Franchise Advisor Plans</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools for franchise advisors
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {advisorPlans.map((plan, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
                <CardHeader className="text-center pt-8 pb-8">
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500 ml-2">/{plan.period}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full ${plan.buttonVariant === 'default' ? 'bg-brand-navy text-brand-gold' : ''}`}
                    variant={plan.buttonVariant}
                    asChild
                  >
                    <Link href="#">
                      {plan.buttonText}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Enterprise CTA */}
        <Card className="bg-brand-navy text-white border-0">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Need Something Custom?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Large franchise networks and enterprise clients can get custom solutions tailored to their specific needs.
            </p>
            <Button className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light px-8 py-3 text-lg" asChild>
              <Link href="/contact">
                Contact Sales Team
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
