import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Investment Calculator | AFPA Connect',
  description: 'Calculate your potential franchise investment and ROI.',
}

export default function InvestmentCalculatorLayout({ children }: { children: ReactNode }) {
  return children
}
