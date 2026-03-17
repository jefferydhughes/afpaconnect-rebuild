import { redirect } from 'next/navigation'

export default function PartnerReferralsPage() {
  redirect('/login?redirect=/partner/referrals')
}
