import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Franchise Your Business | AFPA Connect',
  description: 'Grow your franchise brand with our comprehensive franchising solutions.',
}

export default function FranchiseYourBusinessLayout({ children }: { children: ReactNode }) {
  return children
}
