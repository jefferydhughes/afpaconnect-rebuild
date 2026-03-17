import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-brand-navy">
            <span className="text-2xl font-bold text-brand-gold">A</span>
          </div>
        </div>

        {/* 404 */}
        <h1 className="text-8xl font-bold text-brand-navy mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="bg-brand-navy text-brand-gold hover:bg-brand-navy-light w-full sm:w-auto">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <Link href="/directory">
            <Button variant="outline" className="w-full sm:w-auto">
              <Search className="mr-2 h-4 w-4" />
              Browse Franchises
            </Button>
          </Link>
        </div>

        {/* Helpful links */}
        <div className="mt-10 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Popular pages</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: 'Take the Quiz', href: '/quiz' },
              { label: 'Find an Advisor', href: '/advisors' },
              { label: 'Franchise Guide', href: '/guide' },
              { label: 'FAQ', href: '/faq' },
              { label: 'Contact', href: '/contact' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-brand-navy hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
