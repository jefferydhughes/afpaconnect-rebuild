import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { getCategoryLabel as getCategoryLabelFromConstants } from '@/lib/franchise-categories'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatInvestmentRange(min: number | null, max: number | null): string {
  if (!min && !max) return 'Contact for pricing'
  if (min && !max) return `From ${formatCurrency(min)}`
  if (!min && max) return `Up to ${formatCurrency(max)}`
  return `${formatCurrency(min)} - ${formatCurrency(max)}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function getMatchTier(score: number): {
  label: string
  color: string
  bgColor: string
  borderColor: string
} {
  if (score >= 70) {
    return {
      label: 'Excellent Fit',
      color: 'text-brand-gold',
      bgColor: 'bg-brand-cream',
      borderColor: 'border-brand-gold',
    }
  }
  if (score >= 50) {
    return {
      label: 'Good Fit',
      color: 'text-brand-navy',
      bgColor: 'bg-blue-50',
      borderColor: 'border-brand-navy',
    }
  }
  return {
    label: 'Consider Carefully',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
  }
}

export function getBudgetRangeLabel(range: string): string {
  const labels: Record<string, string> = {
    under_50k: 'Under $50,000',
    '50k_100k': '$50,000 - $100,000',
    '100k_250k': '$100,000 - $250,000',
    '250k_500k': '$250,000 - $500,000',
    over_500k: 'Over $500,000',
  }
  return labels[range] || range
}

export function getCategoryLabel(category: string): string {
  return getCategoryLabelFromConstants(category)
}

export function getBusinessModelLabel(model: string): string {
  const labels: Record<string, string> = {
    storefront: 'Retail / Storefront',
    mobile: 'Mobile Service',
    home_based: 'Work From Home',
    kiosk: 'Kiosk',
    online: 'Online / E-Commerce',
  }
  return labels[model] || model
}

export function getTimeCommitmentLabel(commitment: string): string {
  const labels: Record<string, string> = {
    full_time: 'Full-time (40+ hrs/week)',
    part_time: 'Part-time (10-30 hrs/week)',
    passive: 'Semi-passive investment',
  }
  return labels[commitment] || commitment
}

export function getExperienceLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    none: 'New to business',
    some: 'Some experience',
    extensive: 'Extensive experience',
  }
  return labels[level] || level
}

// Cookie helpers for advisor attribution
export function setAdvisorCookie(advisorId: string): void {
  if (typeof document !== 'undefined') {
    // Cookie expires in 30 days
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString()
    document.cookie = `attributed_advisor=${advisorId};expires=${expires};path=/`
  }
}

export function getAdvisorFromCookie(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/attributed_advisor=([^;]+)/)
  return match ? match[1] : null
}

// URL helpers
export function getAdvisorIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  return params.get('advisor') || params.get('ref') || params.get('a')
}
