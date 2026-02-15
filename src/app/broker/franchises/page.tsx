import { redirect } from 'next/navigation'

export default function BrokerFranchisesPage() {
  redirect('/login?redirect=/broker/franchises')
}
