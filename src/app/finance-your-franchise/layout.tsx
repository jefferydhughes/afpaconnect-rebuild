import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Finance Your Franchise | AFPA Connect',
  description: 'Explore financing options for your franchise investment.',
}

export default function FinanceYourFranchiseLayout({ children }: { children: ReactNode }) {
  return children
}
