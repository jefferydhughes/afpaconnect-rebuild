'use client'

import { useEffect, useState } from 'react'
import { Phone } from 'lucide-react'

interface Props {
  phone: string
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  return raw
}

export default function AdvisorCallButton({ phone }: Props) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(hover: none) and (pointer: coarse)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const pretty = formatPhone(phone)
  const telHref = `tel:${phone.replace(/[^\d+]/g, '')}`

  const baseClasses =
    'inline-flex items-center gap-2 rounded-md bg-white/10 border border-white/30 px-5 py-2 text-sm font-semibold text-white'

  if (isMobile) {
    return (
      <a href={telHref} className={`${baseClasses} hover:bg-white/20 transition-colors`}>
        <Phone className="w-4 h-4" />
        Call {pretty}
      </a>
    )
  }

  return (
    <span
      className={`${baseClasses} cursor-default select-text`}
      aria-label={`Phone number ${pretty}`}
    >
      <Phone className="w-4 h-4" />
      Call {pretty}
    </span>
  )
}
