import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { QueryProvider } from '@/components/providers/query-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'AFPA - Find Your Perfect Franchise Match',
    template: '%s | AFPA',
  },
  description:
    'Discover your ideal franchise opportunity with AFPA\'s AI-powered matching quiz. Connect with 600+ franchise brands and expert advisors.',
  keywords: [
    'franchise',
    'franchise opportunities',
    'franchise matching',
    'franchise quiz',
    'franchise advisor',
    'buy a franchise',
    'franchise investment',
    'AFPA',
  ],
  authors: [{ name: 'AFPA' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://afpaconnect.com',
    siteName: 'AFPA',
    title: 'AFPA - Find Your Perfect Franchise Match',
    description:
      'Discover your ideal franchise opportunity with AFPA\'s AI-powered matching quiz.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AFPA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AFPA - Find Your Perfect Franchise Match',
    description:
      'Discover your ideal franchise opportunity with AFPA\'s AI-powered matching quiz.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  )
}
