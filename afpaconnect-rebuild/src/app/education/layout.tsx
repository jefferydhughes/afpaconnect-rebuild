import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Education Hub | AFPA Connect',
  description: 'Resources and guides for aspiring franchise owners.',
}

export default function EducationLayout({ children }: { children: ReactNode }) {
  return children
}
