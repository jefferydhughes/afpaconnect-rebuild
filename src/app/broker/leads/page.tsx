import { redirect } from 'next/navigation'

export default function BrokerLeadsPage() {
  redirect('/login?redirect=/broker/leads')
}
