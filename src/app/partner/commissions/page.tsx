import { redirect } from 'next/navigation'

export default function PartnerCommissionsPage() {
  redirect('/login?redirect=/partner/commissions')
}
