import { redirect } from 'next/navigation'

export default function FranchisorLeadsPage() {
  redirect('/login?redirect=/franchisor/leads')
}
