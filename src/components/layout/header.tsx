'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Menu, X, ChevronDown, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Take the Quiz', href: '/quiz', highlight: true },
  { name: 'Directory', href: '/directory' },
  {
    name: 'Resources',
    children: [
      { name: 'Franchise Guide', href: '/guide' },
      { name: 'Blog', href: '/blog' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Investment Calculator', href: '/calculator' },
      { name: 'Become an Advisor', href: '/become-advisor' },
      { name: 'FranchiseFit360™ Assessment', href: '/fit360' },
    ],
  },
  { name: 'Find an Advisor', href: '/find-an-advisor' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
    })

    // Keep in sync with sign-in / sign-out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="https://res.cloudinary.com/dr76535kj/image/upload/v1771853591/AFPA-blue-logo1.5x_zvnsdp.webp"
                alt="AFPA"
                width={180}
                height={48}
                className="h-10 w-auto"
                priority
                unoptimized
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {navigation.map((item) =>
              item.children ? (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-1">
                      {item.name}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center">
                    {item.children.map((child) => (
                      <DropdownMenuItem key={child.name} asChild>
                        <Link href={child.href}>{child.name}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    item.highlight
                      ? 'bg-brand-gold text-brand-navy hover:bg-brand-gold-light'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-brand-navy'
                  )}
                >
                  {item.name}
                </Link>
              )
            )}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex md:items-center md:gap-4">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button className="bg-brand-navy text-brand-gold hover:bg-brand-navy-light">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/quiz">
                  <Button className="bg-brand-navy text-brand-gold hover:bg-brand-navy-light">
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-1 pb-4 pt-2">
              {navigation.map((item) =>
                item.children ? (
                  <div key={item.name} className="space-y-1">
                    <div className="px-3 py-2 text-sm font-semibold text-gray-900">
                      {item.name}
                    </div>
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className="block px-6 py-2 text-sm text-gray-600 hover:bg-gray-100"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'block px-3 py-2 text-base font-medium',
                      item.highlight
                        ? 'text-brand-gold'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              )}
              <div className="mt-4 flex flex-col gap-2 px-3">
                {isLoggedIn ? (
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-brand-navy text-brand-gold">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/quiz" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-brand-navy text-brand-gold">
                        Get Started Free
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
