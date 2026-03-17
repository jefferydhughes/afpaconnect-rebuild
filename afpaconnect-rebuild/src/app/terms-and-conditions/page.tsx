import { Card, CardContent } from '@/components/ui/card'

export const metadata = {
  title: 'Terms and Conditions | AFPA Connect',
  description: 'Terms and conditions for using AFPA Connect platform and services.',
}

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-brand-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Terms and Conditions</h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Please read these terms carefully before using our services
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="p-8 lg:p-12">
            <div className="prose prose-slate max-w-none">
              <p className="text-gray-500 mb-8">
                <strong>Last Updated:</strong> January 1, 2024
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  By accessing and using AFPA Connect ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  AFPA Connect provides a platform connecting prospective franchisees with franchise opportunities. Our services include:
                </p>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                  <li>Franchise matching quiz and recommendations</li>
                  <li>Franchise directory and listings</li>
                  <li>Educational resources and content</li>
                  <li>Lead generation and connection services</li>
                  <li>Franchise comparison tools</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts and Registration</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  To access certain features of our platform, you may be required to create an account. You agree to:
                </p>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your information as needed</li>
                  <li>Keep your account credentials secure</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You agree not to use the platform to:
                </p>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Transmit harmful or malicious content</li>
                  <li>Engage in fraudulent or deceptive practices</li>
                  <li>Interfere with the platform's operation</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Franchise Information Disclaimer</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  The franchise information provided on our platform is for informational purposes only. We do not:
                </p>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                  <li>Guarantee the accuracy of franchise information</li>
                  <li>Endorse or recommend specific franchises</li>
                  <li>Provide financial or legal advice</li>
                  <li>Act as a franchise broker or consultant</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Always conduct your own due diligence and consult with legal and financial professionals before making any franchise investment decisions.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Privacy and Data Protection</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information. By using our platform, you consent to our data practices as described in our Privacy Policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  The platform and its original content, features, and functionality are owned by AFPA Connect and are protected by international copyright, trademark, and other intellectual property laws.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  To the maximum extent permitted by law, AFPA Connect shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Termination</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We may terminate or suspend your account and access to the platform immediately, without prior notice or liability, for any reason, including breach of these Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to Terms</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Governing Law</h2>
                <p className="text-gray-600 leading-relaxed">
                  These Terms shall be governed and construed in accordance with the laws of the State of Florida, USA, without regard to its conflict of law provisions.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
