import { describe, it, expect } from 'vitest'
import {
  FRANCHISE_CATEGORIES,
  getCategoryLabel,
  toCategorySlug,
} from '@/lib/franchise-categories'

// ─── FRANCHISE_CATEGORIES constant ─────────────────────────────

describe('FRANCHISE_CATEGORIES', () => {
  it('has 20 categories', () => {
    expect(FRANCHISE_CATEGORIES).toHaveLength(20)
  })

  it('each entry has value and label strings', () => {
    for (const cat of FRANCHISE_CATEGORIES) {
      expect(typeof cat.value).toBe('string')
      expect(typeof cat.label).toBe('string')
      expect(cat.value.length).toBeGreaterThan(0)
      expect(cat.label.length).toBeGreaterThan(0)
    }
  })

  it('all values are unique', () => {
    const values = FRANCHISE_CATEGORIES.map((c) => c.value)
    expect(new Set(values).size).toBe(values.length)
  })

  it('all values are lowercase snake_case', () => {
    for (const cat of FRANCHISE_CATEGORIES) {
      expect(cat.value).toMatch(/^[a-z][a-z0-9_]*$/)
    }
  })

  it('includes the core verticals', () => {
    const values = FRANCHISE_CATEGORIES.map((c) => c.value)
    expect(values).toContain('food_and_beverage')
    expect(values).toContain('home_services')
    expect(values).toContain('education')
    expect(values).toContain('real_estate')
    expect(values).toContain('technology')
    expect(values).toContain('other')
  })

  it('"other" is the last category', () => {
    const last = FRANCHISE_CATEGORIES[FRANCHISE_CATEGORIES.length - 1]
    expect(last.value).toBe('other')
  })
})

// ─── getCategoryLabel ──────────────────────────────────────────

describe('getCategoryLabel', () => {
  it('returns the display label for a known category', () => {
    expect(getCategoryLabel('food_and_beverage')).toBe('Food & Beverage')
    expect(getCategoryLabel('senior_care')).toBe('Senior Care')
    expect(getCategoryLabel('childrens_services')).toBe("Children's Services")
  })

  it('returns a title-cased fallback for unknown categories', () => {
    expect(getCategoryLabel('pet_grooming_deluxe')).toBe('Pet Grooming Deluxe')
  })

  it('returns em dash for null / undefined', () => {
    expect(getCategoryLabel(null)).toBe('—')
    expect(getCategoryLabel(undefined)).toBe('—')
  })

  it('returns em dash for empty string', () => {
    expect(getCategoryLabel('')).toBe('—')
  })
})

// ─── toCategorySlug ────────────────────────────────────────────

describe('toCategorySlug', () => {
  it('converts a display name to a slug', () => {
    expect(toCategorySlug('Pet Services')).toBe('pet_services')
    expect(toCategorySlug('Food & Beverage')).toBe('food_beverage')
  })

  it('strips leading and trailing underscores', () => {
    expect(toCategorySlug('  Hello World  ')).toBe('hello_world')
  })

  it('collapses consecutive separators', () => {
    expect(toCategorySlug('Health---&---Fitness')).toBe('health_fitness')
  })

  it('handles single-word input', () => {
    expect(toCategorySlug('Retail')).toBe('retail')
  })

  it('handles numbers', () => {
    expect(toCategorySlug('Service 360')).toBe('service_360')
  })
})
