import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Check, FileText, Scale, Shield } from 'lucide-react'

export const metadata = {
  title: 'Legal Resources | AFPA Connect',
  description: 'Legal resources and templates for franchise owners.',
}

const resources = [
  {
    title: 'Franchise Agreement Template',
    description: 'Standard franchise agreement template with annotations.',
    type: 'Document',
    icon: FileText
  },
  {
    title: 'FDD Review Checklist',
    description: 'Complete checklist for reviewing Franchise Disclosure Documents.',
    type: 'Checklist',
    icon: Check
  },
  {
    title: 'State Franchise Laws Guide',
    description: 'Overview of franchise regulations by state.',
    type: 'Guide',
    icon: Scale
  },
  {
    title: 'Franchisee Rights',
    description: 'Understanding your rights as a franchisee.',
    type: 'Article',
    icon: Shield
  },
  {
    title: 'Transfer Agreement',
    description: 'Template for franchise ownership transfer.',
    type: 'Document',
    icon: FileText
  },
  {
    title: 'Area Development Agreement',
    description: 'Template for multi-unit development.',
    type: 'Document',
    icon: FileText
  }
]

export default function LegalResourcesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-brand-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Legal Resources</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Essential legal documents, templates, and guides for franchise owners and prospective franchisees.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Disclaimer */}
        <div className="mb-12 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Disclaimer:</strong> These resources are provided for informational purposes only and do not constitute legal advice. 
            Always consult with a qualified franchise attorney before making any legal decisions.
          </p>
        </div>

        {/* Resources */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource, index) => (
            <Card key={index} className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-brand-cream rounded-lg">
                    <resource.icon className="h-6 w-6 text-brand-navy" />
                  </div>
                  <div className="flex-1">
                    <Badge className="mb-2 bg-gray-100 text-gray-700">{resource.type}</Badge>
                    <h3 className="text-lg font-bold mb-2">{resource.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
                    <Button variant="outline" size="sm" className="w-full">
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Need Legal Assistance?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Our network includes qualified franchise attorneys who can help with your specific needs.
          </p>
          <Link href="/contact">
            <Button className="bg-brand-navy text-brand-gold">
              Contact Us
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
