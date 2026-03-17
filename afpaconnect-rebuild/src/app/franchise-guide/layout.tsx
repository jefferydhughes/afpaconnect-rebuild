import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Franchise Guide | AFPA Connect',
  description: 'Learn everything about franchising with our comprehensive guide.',
}

export default function FranchiseGuideLayout({ children }: { children: ReactNode }) {
  return children
}
