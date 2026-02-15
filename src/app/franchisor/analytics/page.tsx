import { redirect } from 'next/navigation'

export default function FranchisorAnalyticsPage() {
  redirect('/login?redirect=/franchisor/analytics')
}
