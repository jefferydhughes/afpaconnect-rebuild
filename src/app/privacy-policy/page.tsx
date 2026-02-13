import { Card, CardContent } from '@/components/ui/card'

export const metadata = {
  title: 'Privacy Policy | AFPA Connect',
  description: 'Privacy policy for AFPA Connect, outlining how we handle user data and protect your privacy.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-brand-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Privacy Policy</h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Your privacy is critically important to us.
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

              <p className="text-gray-600 leading-relaxed mb-4">
                Welcome to AFPA Connect ("us", "we", or "our"). We operate the afpaconnect.com website (hereinafter referred to as the "Service").
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                AFPA Connect is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We may collect information about you in a variety of ways. The information we may collect on the Service includes:
                </p>
                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">Personal Data</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Service or when you choose to participate in various activities related to the Service, such as online chat and message boards.
                </p>
                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">Derivative Data</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Information our servers automatically collect when you access the Service, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Service.
                </p>
                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">Financial Data</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you purchase, order, return, exchange, or request information about our services from the Service. We store only very limited, if any, financial information that we collect. Otherwise, all financial information is stored by our payment processor.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use of Your Information</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Service to:
                </p>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                  <li>Create and manage your account.</li>
                  <li>Email you regarding your account or order.</li>
                  <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Service.</li>
                  <li>Generate a personal profile about you to make future visits to the Service more personalized.</li>
                  <li>Increase the efficiency and operation of the Service.</li>
                  <li>Notify you of updates to the Service.</li>
                  <li>Offer new products, services, and/or recommendations to you.</li>
                  <li>Perform other business activities as needed.</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Disclosure of Your Information</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
                </p>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                  <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
                  <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.</li>
                  <li><strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Security of Your Information</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Policy for Children</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We do not knowingly solicit information from or market to children under the age of 13. If we learn that we have collected personal information from a child under age 13 without verification of parental consent, we will delete that information as quickly as possible.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Changes to This Privacy Policy</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We may update this Privacy Policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal, or regulatory reasons. We will notify you of any changes by posting the new Privacy Policy on this page with a new effective date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Depending on your location, you may have certain rights regarding your personal information, including:
                </p>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                  <li>The right to access, update, or delete the information we have on you</li>
                  <li>The right to rectification if your information is inaccurate or incomplete</li>
                  <li>The right to object to our processing of your personal information</li>
                  <li>The right to restrict the processing of your personal information</li>
                  <li>The right to data portability</li>
                  <li>The right to withdraw consent</li>
                </ul>
                <p className="text-gray-600 leading-relaxed">
                  To exercise these rights, please contact us using the information provided on our Contact page.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
