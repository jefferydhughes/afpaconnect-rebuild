import { redirect } from 'next/navigation'

// "broker" has been renamed to "advisor" per company naming conventions.
// Advisors should use /dashboard/advisor for their portal.
export default function BrokerPage() {
  redirect('/dashboard/advisor')
}
