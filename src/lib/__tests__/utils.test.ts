import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatInvestmentRange,
  slugify,
  getMatchTier,
  getBudgetRangeLabel,
  getBusinessModelLabel,
  getTimeCommitmentLabel,
  getExperienceLevelLabel,
} from '@/lib/utils'

// ─── formatCurrency ────────────────────────────────────────────

describe('formatCurrency', () => {
  it('formats a round number without decimals', () => {
    expect(formatCurrency(50000)).toBe('$50,000')
  })

  it('formats large numbers with commas', () => {
    expect(formatCurrency(1250000)).toBe('$1,250,000')
  })

  it('returns N/A for null', () => {
    expect(formatCurrency(null)).toBe('N/A')
  })

  it('returns N/A for undefined', () => {
    expect(formatCurrency(undefined)).toBe('N/A')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0')
  })
})

// ─── formatInvestmentRange ─────────────────────────────────────

describe('formatInvestmentRange', () => {
  it('shows full range when both min and max provided', () => {
    expect(formatInvestmentRange(50000, 100000)).toBe('$50,000 - $100,000')
  })

  it('shows "From ..." when only min', () => {
    expect(formatInvestmentRange(50000, null)).toBe('From $50,000')
  })

  it('shows "Up to ..." when only max', () => {
    expect(formatInvestmentRange(null, 100000)).toBe('Up to $100,000')
  })

  it('shows "Contact for pricing" when neither', () => {
    expect(formatInvestmentRange(null, null)).toBe('Contact for pricing')
  })

  it('treats 0 as falsy (contact for pricing if both 0)', () => {
    expect(formatInvestmentRange(0, 0)).toBe('Contact for pricing')
  })
})

// ─── slugify ───────────────────────────────────────────────────

describe('slugify', () => {
  it('converts spaces to hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('removes special characters', () => {
    expect(slugify('Food & Beverage!')).toBe('food-beverage')
  })

  it('collapses multiple hyphens', () => {
    expect(slugify('one---two')).toBe('one-two')
  })

  it('lowercases everything', () => {
    expect(slugify('My Franchise')).toBe('my-franchise')
  })

  it('handles already-slugged input', () => {
    expect(slugify('already-slugged')).toBe('already-slugged')
  })

  it('handles empty string', () => {
    expect(slugify('')).toBe('')
  })
})

// ─── getMatchTier ──────────────────────────────────────────────

describe('getMatchTier', () => {
  it('returns "Excellent Fit" for score >= 70', () => {
    const tier = getMatchTier(85)
    expect(tier.label).toBe('Excellent Fit')
    expect(tier.color).toBe('text-brand-gold')
  })

  it('returns "Good Fit" for score 50-69', () => {
    const tier = getMatchTier(60)
    expect(tier.label).toBe('Good Fit')
    expect(tier.color).toBe('text-brand-navy')
  })

  it('returns "Consider Carefully" for score < 50', () => {
    const tier = getMatchTier(30)
    expect(tier.label).toBe('Consider Carefully')
    expect(tier.color).toBe('text-gray-600')
  })

  it('boundary: 70 is Excellent', () => {
    expect(getMatchTier(70).label).toBe('Excellent Fit')
  })

  it('boundary: 50 is Good', () => {
    expect(getMatchTier(50).label).toBe('Good Fit')
  })

  it('boundary: 49 is Consider Carefully', () => {
    expect(getMatchTier(49).label).toBe('Consider Carefully')
  })

  it('all tiers include bgColor and borderColor', () => {
    for (const score of [90, 55, 20]) {
      const tier = getMatchTier(score)
      expect(tier.bgColor).toBeTruthy()
      expect(tier.borderColor).toBeTruthy()
    }
  })
})

// ─── getBudgetRangeLabel ───────────────────────────────────────

describe('getBudgetRangeLabel', () => {
  it('returns correct labels for known ranges', () => {
    expect(getBudgetRangeLabel('under_50k')).toBe('Under $50,000')
    expect(getBudgetRangeLabel('50k_100k')).toBe('$50,000 - $100,000')
    expect(getBudgetRangeLabel('100k_250k')).toBe('$100,000 - $250,000')
    expect(getBudgetRangeLabel('250k_500k')).toBe('$250,000 - $500,000')
    expect(getBudgetRangeLabel('over_500k')).toBe('Over $500,000')
  })

  it('returns the raw value for unknown ranges', () => {
    expect(getBudgetRangeLabel('custom_range')).toBe('custom_range')
  })
})

// ─── getBusinessModelLabel ─────────────────────────────────────

describe('getBusinessModelLabel', () => {
  it('maps all 5 known models', () => {
    expect(getBusinessModelLabel('storefront')).toBe('Retail / Storefront')
    expect(getBusinessModelLabel('mobile')).toBe('Mobile Service')
    expect(getBusinessModelLabel('home_based')).toBe('Work From Home')
    expect(getBusinessModelLabel('kiosk')).toBe('Kiosk')
    expect(getBusinessModelLabel('online')).toBe('Online / E-Commerce')
  })

  it('returns raw value for unknown model', () => {
    expect(getBusinessModelLabel('vending')).toBe('vending')
  })
})

// ─── getTimeCommitmentLabel ────────────────────────────────────

describe('getTimeCommitmentLabel', () => {
  it('maps all 3 known commitments', () => {
    expect(getTimeCommitmentLabel('full_time')).toBe('Full-time (40+ hrs/week)')
    expect(getTimeCommitmentLabel('part_time')).toBe('Part-time (10-30 hrs/week)')
    expect(getTimeCommitmentLabel('passive')).toBe('Semi-passive investment')
  })

  it('returns raw value for unknown commitment', () => {
    expect(getTimeCommitmentLabel('micro')).toBe('micro')
  })
})

// ─── getExperienceLevelLabel ───────────────────────────────────

describe('getExperienceLevelLabel', () => {
  it('maps all 3 known levels', () => {
    expect(getExperienceLevelLabel('none')).toBe('New to business')
    expect(getExperienceLevelLabel('some')).toBe('Some experience')
    expect(getExperienceLevelLabel('extensive')).toBe('Extensive experience')
  })

  it('returns raw value for unknown level', () => {
    expect(getExperienceLevelLabel('expert')).toBe('expert')
  })
})
