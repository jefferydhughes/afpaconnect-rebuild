import { redirect } from 'next/navigation'

export default function FranchisorProfilePage() {
  redirect('/login?redirect=/franchisor/profile')
}
