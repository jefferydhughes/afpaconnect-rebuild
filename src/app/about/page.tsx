import Link from 'next/link'
import { 
  Target, 
  Users, 
  Award, 
  TrendingUp, 
  CheckCircle,
  ArrowRight,
  Building2,
  Heart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const metadata = {
  title: 'About AFPA',
  description: 'Learn about the American Franchise Professionals Association and our mission to connect aspiring franchise owners with their perfect business opportunities.',
}

const values = [
  {
    icon: Target,
    title: 'Precision Matching',
    description: 'Our AI technology analyzes dozens of factors to connect you with franchises that truly fit your goals and lifestyle.',
  },
  {
    icon: Users,
    title: 'Expert Guidance',
    description: 'Our network of certified franchise advisors provides personalized support throughout your journey.',
  },
  {
    icon: Award,
    title: 'Quality Standards',
    description: 'Every franchise in our directory is vetted for legitimacy, with access to FDD data and franchisee satisfaction scores.',
  },
  {
    icon: Heart,
    title: 'Your Success',
    description: "We're committed to helping you find not just any franchise, but the RIGHT franchise for your unique situation.",
  },
]

const stats = [
  { value: '600+', label: 'Franchise Brands' },
  { value: '10,000+', label: 'Matches Made' },
  { value: '50+', label: 'Expert Advisors' },
  { value: '95%', label: 'Satisfaction Rate' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-brand-navy text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About AFPA
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            The American Franchise Professionals Association is dedicated to 
            connecting aspiring franchise owners with life-changing business opportunities.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-brand-navy">
                  {stat.value}
                </p>
                <p className="text-gray-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We believe everyone deserves access to quality franchise opportunities 
              and expert guidance—regardless of their background or where they are 
              in their entrepreneurial journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-brand-cream rounded-lg flex-shrink-0">
                      <value.icon className="h-6 w-6 text-brand-navy" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {value.title}
                      </h3>
                      <p className="text-gray-600">{value.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="bg-brand-cream py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-brand-navy mb-6">Our Story</h2>
            
            <p className="text-gray-700">
              AFPA was founded with a simple observation: the franchise industry, 
              despite offering incredible opportunities for entrepreneurs, was often 
              confusing and overwhelming for newcomers. With thousands of franchise 
              brands, complex disclosure documents, and high-pressure sales tactics, 
              too many aspiring business owners either gave up or made poor choices.
            </p>

            <p className="text-gray-700">
              We set out to change that. By combining cutting-edge AI technology with 
              the expertise of seasoned franchise professionals, we&apos;ve created a 
              platform that puts the power back in the hands of franchise buyers.
            </p>

            <p className="text-gray-700">
              Our free quiz takes just 3 minutes but leverages sophisticated matching 
              algorithms to identify franchises that align with your unique goals, 
              budget, skills, and lifestyle preferences. And when you&apos;re ready for 
              human guidance, our network of certified franchise advisors is here to 
              help—at no cost to you.
            </p>
          </div>
        </div>
      </div>

      {/* What We Do */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            What We Offer
          </h2>

          <div className="space-y-6">
            <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Free AI-Powered Matching
                </h3>
                <p className="text-gray-600">
                  Our FranchiseFit360™ quiz analyzes your preferences and matches you 
                  with franchises from our database of 600+ verified opportunities.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Comprehensive Franchise Directory
                </h3>
                <p className="text-gray-600">
                  Browse, filter, and compare franchise opportunities with detailed 
                  information including investment requirements, FDD summaries, and 
                  franchisee satisfaction data.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Expert Advisor Network
                </h3>
                <p className="text-gray-600">
                  Connect with certified franchise consultants who provide personalized 
                  guidance throughout your franchise journey—completely free of charge.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Educational Resources
                </h3>
                <p className="text-gray-600">
                  Access our library of guides, blog posts, and tools to help you 
                  understand the franchise buying process and make informed decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-brand-navy py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Find Your Perfect Franchise?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of aspiring franchise owners who have discovered their 
            path to business ownership through AFPA.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quiz">
              <Button size="lg" className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light">
                Take the Free Quiz
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/advisors">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-brand-navy">
                Talk to an Advisor
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
