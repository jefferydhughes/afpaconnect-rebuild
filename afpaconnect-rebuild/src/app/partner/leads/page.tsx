import { redirect } from 'next/navigation'

export default function PartnerLeadsPage() {
  redirect('/login?redirect=/partner/leads')
}
