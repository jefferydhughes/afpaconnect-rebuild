import { redirect } from 'next/navigation'

export default function FranchisorApplicationsPage() {
  redirect('/login?redirect=/franchisor/applications')
}
