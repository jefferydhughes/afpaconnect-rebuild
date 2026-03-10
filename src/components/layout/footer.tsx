import Link from 'next/link'

const footerLinks = {
  explore: [
    { name: 'Franchise Directory', href: '/directory' },
    { name: 'Take the Quiz', href: '/quiz' },
    { name: 'Find an Advisor', href: '/find-an-advisor' },
    { name: 'Investment Calculator', href: '/calculator' },
  ],
  resources: [
    { name: 'Franchise Guide', href: '/guide' },
    { name: 'Blog', href: '/blog' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Become an Advisor', href: '/become-advisor' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Our Team', href: '/our-team' },
    { name: 'Our Advisors', href: '/advisors' },
    { name: 'Contact', href: '/contact' },
    { name: 'Submit Support Ticket', href: 'https://api.leadconnectorhq.com/widget/form/c2zHm8pcf4gDc12v8iQS' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms of Service', href: '/terms-and-conditions' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-navy">
                <span className="text-lg font-bold text-brand-gold">A</span>
              </div>
              <span className="text-xl font-bold text-brand-navy">AFPA</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-gray-600">
              The American Franchise Professionals Association connects aspiring franchise owners with their perfect business
              opportunities through AI-powered matching and expert guidance.
            </p>
            <div className="mt-6">
              <p className="text-sm font-semibold text-brand-navy">
                Ready to find your franchise?
              </p>
              <Link
                href="/quiz"
                className="mt-2 inline-block rounded-full bg-brand-gold px-6 py-2 text-sm font-semibold text-brand-navy transition hover:bg-brand-gold-light"
              >
                Take the Free Quiz
              </Link>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-sm font-semibold text-brand-navy">Explore</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 transition hover:text-brand-navy"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-brand-navy">Resources</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 transition hover:text-brand-navy"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-brand-navy">Company</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) =>
                link.href.startsWith('http') ? (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-600 transition hover:text-brand-navy"
                    >
                      {link.name}
                    </a>
                  </li>
                ) : (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 transition hover:text-brand-navy"
                    >
                      {link.name}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-gray-200 pt-8 md:flex-row">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} AFPA - American Franchise Professionals Association. All rights reserved.
          </p>
          <div className="mt-4 flex gap-6 md:mt-0">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm text-gray-500 transition hover:text-brand-navy"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
