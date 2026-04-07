/**
 * Canonical franchise category list.
 * `value` is the primary label stored in the DB.  `aliases` are alternate
 * spellings / legacy slugs that also exist in the DB and should match
 * when this category is selected in the directory filter.
 */
export type FranchiseCategory = {
  value: string
  label: string
  aliases?: string[]
}

export const FRANCHISE_CATEGORIES: FranchiseCategory[] = [
  { value: 'Food & Beverage',       label: 'Food & Beverage',       aliases: ['food_and_beverage', 'food_beverage'] },
  { value: 'Health & Wellness',     label: 'Health & Wellness',     aliases: ['health_and_fitness', 'healthcare', 'Beauty & Personal Care'] },
  { value: 'Home Services',         label: 'Home Services',         aliases: ['home_services', 'Home Improvement', 'Construction & Home Services', 'Construction & Renovation'] },
  { value: 'Business Services',     label: 'Business Services',     aliases: ['business_services', 'Professional Services', 'Consulting', 'Commercial Services', 'Services', 'services', 'Service', 'Service Industry'] },
  { value: "Children's Education",  label: "Children's Education",  aliases: ['childrens_services', "Children's Entertainment", 'Education & Training'] },
  { value: 'Retail',                label: 'Retail',                aliases: ['retail'] },
  { value: 'Real Estate',           label: 'Real Estate',           aliases: ['real_estate', 'Real Estate Services'] },
  { value: 'Pet Services',          label: 'Pet Services',          aliases: ['pet_services', 'Pet Care'] },
  { value: 'Hospitality',           label: 'Hospitality',           aliases: ['Travel & Leisure', 'Travel & Tourism', 'travel'] },
  { value: 'Automotive Services',   label: 'Automotive',            aliases: ['automotive', 'Automotive'] },
  { value: 'Entertainment',         label: 'Entertainment',         aliases: ['entertainment', 'Entertainment & Recreation', 'Sports & Recreation'] },
  { value: 'Financial Services',    label: 'Financial Services',    aliases: ['financial_services'] },
  { value: 'Education',             label: 'Education',             aliases: ['education'] },
  { value: 'Cleaning Services',     label: 'Cleaning Services',     aliases: ['cleaning_services'] },
  { value: 'Senior Care',           label: 'Senior Care',           aliases: ['senior_care'] },
  { value: 'Technology Services',   label: 'Technology',            aliases: ['technology', 'Technology Services'] },
  { value: 'Staffing',              label: 'Staffing & Employment', aliases: ['staffing', 'Employment Services'] },
  { value: 'Transportation',        label: 'Transportation',        aliases: ['Transportation & Logistics', 'Logistics & Transportation'] },
  { value: 'Media & Advertising',   label: 'Marketing & Media',     aliases: ['Advertising & Marketing', 'Media & Publishing'] },
  { value: 'Environmental Services',label: 'Environmental Services',aliases: [] },
  { value: 'other',                 label: 'Other',                 aliases: ['Arts & Crafts'] },
]

/**
 * Given a category value from the dropdown, return all DB values that
 * should match (the primary value + any aliases).
 */
export function getCategoryMatchValues(selected: string): string[] {
  const cat = FRANCHISE_CATEGORIES.find((c) => c.value === selected)
  if (!cat) return [selected]
  return [cat.value, ...(cat.aliases || [])]
}

/** Lookup a label for a stored category value. Falls back to a title-cased version. */
export function getCategoryLabel(value: string | null | undefined): string {
  if (!value) return '—'
  // Check primary value
  const byValue = FRANCHISE_CATEGORIES.find((c) => c.value === value)
  if (byValue) return byValue.label
  // Check aliases
  const byAlias = FRANCHISE_CATEGORIES.find((c) => c.aliases?.includes(value))
  if (byAlias) return byAlias.label
  return value.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

/** Convert a human-readable name into a category slug, e.g. "Pet Care" → "pet_care" */
export function toCategorySlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}
