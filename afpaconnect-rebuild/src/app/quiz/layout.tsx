import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Franchise Quiz',
  description: 'Take our free 3-minute quiz to discover franchise opportunities matched to your goals, budget, and lifestyle.',
}

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
