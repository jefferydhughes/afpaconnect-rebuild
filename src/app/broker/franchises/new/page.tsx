import { redirect } from 'next/navigation'

export default function BrokerFranchisesNewPage() {
  redirect('/login?redirect=/broker/franchises/new')
}
