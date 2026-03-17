import Link from 'next/link'
import { 
  BookOpen, 
  CheckCircle, 
  DollarSign, 
  FileText, 
  Users, 
  Building2,
  ArrowRight,
  Download,
  Clock,
  Target
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = {
  title: 'Complete Franchise Guide',
  description: 'Everything you need to know about buying a franchise - from research to opening day.',
}

const guideSteps = [
  {
    step: 1,
    title: 'Self-Assessment',
    icon: Target,
    description: 'Understand your goals, budget, and what you want from franchise ownership.',
    items: [
      'Define your investment budget and liquid capital',
      'Identify your skills and interests',
      'Determine your time commitment',
      'Consider your risk tolerance',
      'Evaluate location preferences',
    ],
    cta: { text: 'Take Our Quiz', href: '/quiz' },
  },
  {
    step: 2,
    title: 'Research & Discovery',
    icon: BookOpen,
    description: 'Explore franchise opportunities and narrow down your options.',
    items: [
      'Browse franchise directories and categories',
      'Request information from multiple brands',
      'Compare investment requirements',
      'Read industry reports and reviews',
      'Connect with a franchise advisor',
    ],
    cta: { text: 'Browse Directory', href: '/directory' },
  },
  {
    step: 3,
    title: 'Due Diligence',
    icon: FileText,
    description: 'Thoroughly evaluate your top franchise choices.',
    items: [
      'Review the Franchise Disclosure Document (FDD)',
      'Analyze Item 19 financial performance data',
      'Contact existing franchisees',
      'Understand all fees and obligations',
      'Consult with a franchise attorney',
    ],
    cta: { text: 'Learn About FDDs', href: '/faq' },
  },
  {
    step: 4,
    title: 'Financing',
    icon: DollarSign,
    description: 'Secure funding for your franchise investment.',
    items: [
      'Calculate total investment needed',
      'Explore SBA loan options',
      'Consider 401(k)/IRA rollovers (ROBS)',
      'Evaluate franchisor financing programs',
      'Prepare your business plan',
    ],
    cta: { text: 'Use Calculator', href: '/calculator' },
  },
  {
    step: 5,
    title: 'Discovery Day & Agreement',
    icon: Users,
    description: 'Meet the franchisor team and finalize your decision.',
    items: [
      'Attend Discovery Day at headquarters',
      'Meet the leadership team',
      'Ask remaining questions',
      'Review the franchise agreement',
      'Sign and pay franchise fee',
    ],
  },
  {
    step: 6,
    title: 'Launch & Operations',
    icon: Building2,
    description: 'Complete training and open your franchise.',
    items: [
      'Complete initial training program',
      'Secure location (if applicable)',
      'Hire and train staff',
      'Implement marketing plan',
      'Grand opening!',
    ],
  },
]

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-brand-navy text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-brand-gold rounded-full">
              <BookOpen className="h-10 w-10 text-brand-navy" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">The Complete Franchise Guide</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your step-by-step roadmap to franchise ownership, from initial research to opening day.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-brand-navy">6</p>
              <p className="text-sm text-gray-600">Key Steps</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-brand-navy">3-12</p>
              <p className="text-sm text-gray-600">Months Timeline</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-brand-navy">600+</p>
              <p className="text-sm text-gray-600">Franchise Options</p>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Timeline */}
        <div className="space-y-8">
          {guideSteps.map((step, index) => (
            <Card key={step.step} className="relative overflow-hidden">
              {/* Step Number Badge */}
              <div className="absolute top-0 left-0 bg-brand-navy text-brand-gold px-4 py-2 rounded-br-lg font-bold">
                Step {step.step}
              </div>

              <CardHeader className="pt-12 pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-cream rounded-lg">
                    <step.icon className="h-6 w-6 text-brand-navy" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                    <p className="text-gray-600 mt-1">{step.description}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {step.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>

                {step.cta && (
                  <Link href={step.cta.href}>
                    <Button variant="outline">
                      {step.cta.text}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </CardContent>

              {/* Connector Line */}
              {index < guideSteps.length - 1 && (
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-0.5 h-8 bg-brand-gold" />
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Key Tips Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Tips for Success</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-green-800 mb-3">✓ Do This</h3>
                <ul className="space-y-2 text-sm text-green-700">
                  <li>• Talk to at least 5-10 existing franchisees</li>
                  <li>• Have an attorney review the FDD</li>
                  <li>• Understand ALL costs, not just the franchise fee</li>
                  <li>• Visit multiple franchise locations</li>
                  <li>• Prepare for 6-12 months without profit</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-red-800 mb-3">✗ Avoid This</h3>
                <ul className="space-y-2 text-sm text-red-700">
                  <li>• Rushing the decision due to sales pressure</li>
                  <li>• Ignoring the financial disclosure items</li>
                  <li>• Skipping Discovery Day</li>
                  <li>• Underestimating working capital needs</li>
                  <li>• Choosing based on brand name alone</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Resources Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Helpful Resources</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link href="/calculator">
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <DollarSign className="h-8 w-8 text-brand-gold mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">Investment Calculator</h3>
                  <p className="text-sm text-gray-600">Estimate your ROI</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/faq">
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <FileText className="h-8 w-8 text-brand-gold mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">FAQ</h3>
                  <p className="text-sm text-gray-600">Common questions answered</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/advisors">
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-brand-gold mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">Find an Advisor</h3>
                  <p className="text-sm text-gray-600">Get expert guidance</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-brand-navy rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">
            Ready to Start Your Franchise Journey?
          </h2>
          <p className="text-gray-300 mb-6 max-w-xl mx-auto">
            Take our free quiz to get personalized franchise recommendations 
            based on your goals, budget, and preferences.
          </p>
          <Link href="/quiz">
            <Button size="lg" className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light">
              Take the Free Quiz
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
