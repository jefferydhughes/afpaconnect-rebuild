import { redirect } from 'next/navigation'

export default function FranchisorListingsNewPage() {
  redirect('/login?redirect=/franchisor/listings/new')
}
