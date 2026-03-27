import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mocks ─────────────────────────────────────────────────────

const mockRedirect = vi.fn()
vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => {
    mockRedirect(...args)
    throw new Error(`NEXT_REDIRECT:${args[0]}`)
  },
}))

const mockGetUser = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
  }),
  createAdminClient: () => ({
    from: mockFrom,
  }),
}))

import {
  requireAdmin,
  requireAdvisor,
  requireFranchisor,
  requireFranchiseRep,
  getAuthUserRole,
} from '@/lib/require-role'

// ─── Helpers ───────────────────────────────────────────────────

function mockAuth(user: { id: string } | null) {
  mockGetUser.mockResolvedValue({ data: { user } })
}

function mockProfile(role: string | null, fullName = 'Test User') {
  if (role === null) {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => ({ data: null }),
        }),
      }),
    })
  } else {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => ({ data: { role, full_name: fullName } }),
        }),
      }),
    })
  }
}

// ─── Tests ─────────────────────────────────────────────────────

describe('getAuthUserRole', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns user and profile when authenticated', async () => {
    mockAuth({ id: 'user-1' })
    mockProfile('admin', 'Jeff Admin')

    const result = await getAuthUserRole()
    expect(result.user).toEqual({ id: 'user-1' })
    expect(result.profile).toEqual({ role: 'admin', full_name: 'Jeff Admin' })
  })

  it('returns null user and null profile when not authenticated', async () => {
    mockAuth(null)

    const result = await getAuthUserRole()
    expect(result.user).toBeNull()
    expect(result.profile).toBeNull()
  })
})

describe('requireAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns user and profile for admin role', async () => {
    mockAuth({ id: 'admin-1' })
    mockProfile('admin')

    const result = await requireAdmin()
    expect(result.user.id).toBe('admin-1')
    expect(result.profile.role).toBe('admin')
  })

  it('redirects to login when no user', async () => {
    mockAuth(null)

    await expect(requireAdmin()).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/login?redirect=/dashboard/admin')
  })

  it('redirects to /dashboard when user is not admin', async () => {
    mockAuth({ id: 'user-2' })
    mockProfile('advisor')

    await expect(requireAdmin()).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
  })

  it('redirects to /dashboard when profile is null', async () => {
    mockAuth({ id: 'user-3' })
    mockProfile(null)

    await expect(requireAdmin()).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
  })

  it('accepts custom login redirect', async () => {
    mockAuth(null)

    await expect(requireAdmin('/custom')).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/login?redirect=/custom')
  })
})

describe('requireAdvisor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns user and profile for advisor role', async () => {
    mockAuth({ id: 'adv-1' })
    mockProfile('advisor')

    const result = await requireAdvisor()
    expect(result.profile.role).toBe('advisor')
  })

  it('redirects to login when no user', async () => {
    mockAuth(null)

    await expect(requireAdvisor()).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/login?redirect=/dashboard/advisor')
  })

  it('redirects to /dashboard when wrong role', async () => {
    mockAuth({ id: 'user-4' })
    mockProfile('admin')

    await expect(requireAdvisor()).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
  })
})

describe('requireFranchisor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns user and profile for franchisor role', async () => {
    mockAuth({ id: 'fr-1' })
    mockProfile('franchisor')

    const result = await requireFranchisor()
    expect(result.profile.role).toBe('franchisor')
  })

  it('redirects to login when no user', async () => {
    mockAuth(null)

    await expect(requireFranchisor()).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/login?redirect=/dashboard/franchisor')
  })

  it('redirects to /dashboard when wrong role', async () => {
    mockAuth({ id: 'user-5' })
    mockProfile('advisor')

    await expect(requireFranchisor()).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
  })
})

describe('requireFranchiseRep', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns user and profile for franchise_rep role', async () => {
    mockAuth({ id: 'rep-1' })
    mockProfile('franchise_rep')

    const result = await requireFranchiseRep()
    expect(result.profile.role).toBe('franchise_rep')
  })

  it('redirects to login when no user', async () => {
    mockAuth(null)

    await expect(requireFranchiseRep()).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/login?redirect=/dashboard/franchise-rep')
  })

  it('redirects to /dashboard when wrong role', async () => {
    mockAuth({ id: 'user-6' })
    mockProfile('admin')

    await expect(requireFranchiseRep()).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
  })
})
