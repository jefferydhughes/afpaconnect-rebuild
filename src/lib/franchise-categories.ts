/**
 * Canonical franchise category list.
 * Used by the admin FranchiseForm, the public directory filter, and anywhere
 * else categories are displayed.  Update this one file to add or rename a category.
 */
export const FRANCHISE_CATEGORIES: { value: string; label: string }[] = [
  { value: 'food_and_beverage',   label: 'Food & Beverage' },
  { value: 'home_services',       label: 'Home Services' },
  { value: 'health_and_fitness',  label: 'Health & Fitness' },
  { value: 'automotive',          label: 'Automotive' },
  { value: 'business_services',   label: 'Business Services' },
  { value: 'education',           label: 'Education' },
  { value: 'retail',              label: 'Retail' },
  { value: 'cleaning_services',   label: 'Cleaning Services' },
  { value: 'senior_care',         label: 'Senior Care' },
  { value: 'real_estate',         label: 'Real Estate' },
  { value: 'beauty_and_wellness', label: 'Beauty & Wellness' },
  { value: 'entertainment',       label: 'Entertainment' },
  { value: 'pet_services',        label: 'Pet Services' },
  { value: 'financial_services',  label: 'Financial Services' },
  { value: 'technology',          label: 'Technology' },
  { value: 'staffing',            label: 'Staffing' },
  { value: 'travel',              label: 'Travel' },
  { value: 'fitness',             label: 'Fitness' },
  { value: 'childrens_services',  label: "Children's Services" },
  { value: 'other',               label: 'Other' },
]

/** Lookup a label for a stored category value. Falls back to a title-cased version of the slug. */
export function getCategoryLabel(value: string | null | undefined): string {
  if (!value) return '—'
  return (
    FRANCHISE_CATEGORIES.find((c) => c.value === value)?.label ??
    value.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  )
}

/** Convert a human-readable name into a category slug, e.g. "Pet Care" → "pet_care" */
export function toCategorySlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}
