import { redirect } from 'next/navigation'

export default function FranchisorSettingsPage() {
  redirect('/login?redirect=/franchisor/settings')
}
