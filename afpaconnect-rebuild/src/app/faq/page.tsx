import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export const metadata = {
  title: 'Frequently Asked Questions',
  description: 'Find answers to common questions about franchising, our quiz, and working with franchise advisors.',
}

const faqCategories = [
  {
    title: 'About Franchising',
    faqs: [
      {
        question: 'What is a franchise?',
        answer: 'A franchise is a type of business where the owner (franchisee) pays for the right to use an established brand name, business model, and support system from the franchisor. This allows entrepreneurs to operate their own business with the backing of a proven system and recognized brand.',
      },
      {
        question: 'How much does it cost to buy a franchise?',
        answer: 'Franchise costs vary widely depending on the brand and industry. Initial investments can range from under $50,000 for home-based businesses to over $1 million for large restaurant or hotel franchises. Costs typically include the franchise fee, equipment, inventory, real estate, and working capital.',
      },
      {
        question: 'What is a Franchise Disclosure Document (FDD)?',
        answer: 'The FDD is a legal document that franchisors must provide to potential franchisees at least 14 days before any agreement is signed or payment is made. It contains 23 items of information about the franchisor, the franchise system, and the franchise agreement, including fees, obligations, and financial performance data.',
      },
      {
        question: 'Do I need business experience to own a franchise?',
        answer: "Not necessarily. Many franchises are designed for first-time business owners and provide comprehensive training. However, some franchises do require specific industry experience or management background. Our quiz and advisors can help match you with franchises that fit your experience level.",
      },
      {
        question: 'What ongoing fees do franchisees pay?',
        answer: 'Most franchises require ongoing royalty fees (typically 4-8% of gross sales) and marketing/advertising fees (1-4% of gross sales). These fees support the franchisor in providing ongoing training, support, marketing, and brand development.',
      },
    ],
  },
  {
    title: 'About AFPA',
    faqs: [
      {
        question: 'What is AFPA?',
        answer: 'AFPA (American Franchise Professionals Association) is a franchise matching platform that uses AI technology to connect aspiring franchise owners with opportunities that match their goals, budget, and lifestyle. We provide free tools, resources, and access to certified franchise advisors.',
      },
      {
        question: 'Is the franchise quiz really free?',
        answer: "Yes! Our FranchiseFit360™ quiz is completely free with no obligation. We believe everyone deserves access to quality franchise matching, regardless of where they are in their journey.",
      },
      {
        question: 'How does the AI matching work?',
        answer: 'Our AI analyzes your quiz responses against our database of 600+ franchise opportunities. It considers factors like investment budget, preferred industries, time commitment, business model preferences, and personal goals to generate personalized match scores and recommendations.',
      },
      {
        question: 'Is my information kept private?',
        answer: 'Yes, we take privacy seriously. Your information is only shared with franchise advisors you choose to connect with or franchises you request information from. We never sell your data to third parties. See our Privacy Policy for details.',
      },
    ],
  },
  {
    title: 'Working with Advisors',
    faqs: [
      {
        question: 'What does a franchise advisor do?',
        answer: 'Franchise advisors (also called franchise consultants or brokers) help you navigate the franchise buying process. They provide personalized recommendations, arrange introductions to franchisors, help you understand FDDs, and guide you through due diligence—all at no cost to you.',
      },
      {
        question: 'How do advisors get paid if the service is free?',
        answer: 'Franchise advisors are compensated by franchisors when they help place a franchisee. This fee is already built into the franchise cost, so you pay the same whether you use an advisor or go direct. Using an advisor gives you free expert guidance.',
      },
      {
        question: 'Am I obligated to use an advisor?',
        answer: "No, you can use our platform and quiz without ever speaking to an advisor. However, most users find that advisors add significant value by saving time, providing insider knowledge, and helping avoid costly mistakes.",
      },
      {
        question: 'Can I work with multiple advisors?',
        answer: "While you can, we recommend working with one advisor to ensure a cohesive experience. Different advisors may have access to different franchise brands, so it's worth discussing your goals upfront to ensure they can help with your interests.",
      },
    ],
  },
  {
    title: 'The Franchise Process',
    faqs: [
      {
        question: 'How long does it take to open a franchise?',
        answer: 'The timeline varies by franchise, but typically ranges from 3-12 months. This includes research, due diligence, financing, training, site selection (if applicable), and buildout. Some home-based franchises can launch faster.',
      },
      {
        question: 'What financing options are available?',
        answer: 'Common financing options include SBA loans, conventional bank loans, franchisor financing, 401(k)/IRA rollovers (ROBS), home equity loans, and personal savings. Many franchisors have relationships with lenders familiar with their brand.',
      },
      {
        question: 'What should I look for in a franchise?',
        answer: "Key factors include: total investment vs. your budget, industry growth trends, franchisor support and training, existing franchisee satisfaction, territory availability, your interest in the business, and alignment with your lifestyle goals.",
      },
      {
        question: "What is 'Discovery Day'?",
        answer: "Discovery Day is typically the final step before signing a franchise agreement. You'll visit the franchisor's headquarters, meet the leadership team, tour facilities, and get a final sense of the company culture. It's your chance to ask remaining questions and decide if it's the right fit.",
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-brand-navy text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-300">
            Everything you need to know about franchising and how AFPA can help
          </p>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {faqCategories.map((category) => (
            <div key={category.title}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {category.title}
              </h2>
              <Accordion type="single" collapsible className="space-y-4">
                {category.faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`${category.title}-${index}`}
                    className="bg-white rounded-lg border px-6"
                  >
                    <AccordionTrigger className="text-left font-medium py-4 hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {/* Still Have Questions */}
        <div className="mt-16 bg-brand-cream rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-brand-navy mb-4">
            Still Have Questions?
          </h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Our franchise advisors are here to help. Schedule a free consultation 
            to get personalized answers to your franchise questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/advisors">
              <Button className="bg-brand-navy text-brand-gold hover:bg-brand-navy-light">
                Talk to an Advisor
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Ready to Find Your Perfect Franchise?
          </h3>
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
