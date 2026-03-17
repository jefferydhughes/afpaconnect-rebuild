import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function requireAdminUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') return null
  return user
}

// GET /api/admin/location-pages — list all location pages
export async function GET() {
  try {
    const user = await requireAdminUser()
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('location_pages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}

// POST /api/admin/location-pages — create one or many location pages
// Body: single object OR array of objects with at minimum { brand, city }
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdminUser()
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const rows = Array.isArray(body) ? body : [body]

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No rows provided' }, { status: 400 })
    }

    const records = rows.map((row: any) => {
      const brand = String(row.brand || '').trim()
      const city = String(row.city || '').trim()

      if (!brand || !city) throw new Error(`Each row requires brand and city. Got: ${JSON.stringify(row)}`)

      const brandSlug = row.brand_slug || slugify(brand)
      const citySlug = row.city_slug || slugify(city)
      const slug = row.slug || `${brandSlug}-${citySlug}`

      return {
        brand,
        brand_slug: brandSlug,
        city,
        city_slug: citySlug,
        province: row.province || null,
        country: row.country || 'USA',
        slug,
        status: row.status || 'available',
        meta_title: row.meta_title || null,
        meta_description: row.meta_description || null,
        population: row.population ? Number(row.population) : null,
        market_size: row.market_size || null,
      }
    })

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('location_pages')
      .upsert(records, { onConflict: 'slug', ignoreDuplicates: false })
      .select('id, slug, brand, city')

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data, count: data?.length ?? 0 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}

// DELETE /api/admin/location-pages?id=... — delete by id
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAdminUser()
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id param required' }, { status: 400 })

    const admin = createAdminClient()
    const { error } = await admin
      .from('location_pages')
      .delete()
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}

// PATCH /api/admin/location-pages?id=... — update fields (used after AI generation)
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAdminUser()
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id param required' }, { status: 400 })

    const patch = await request.json()

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('location_pages')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
