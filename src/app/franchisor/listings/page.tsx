import { redirect } from 'next/navigation'

export default function FranchisorListingsPage() {
  redirect('/login?redirect=/franchisor/listings')
}
