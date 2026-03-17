import { redirect } from 'next/navigation'

export default function BrokerApplicationsPage() {
  redirect('/login?redirect=/broker/applications')
}
