import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { Advisor, Profile } from '@/types/database'
import { z } from 'zod'

const advisorPayloadSchema = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().min(1).max(120).optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
  title: z.string().trim().max(120).optional().nullable(),
  bio: z.string().trim().max(5000).optional().nullable(),
  image_url: z.string().trim().url().max(2048).optional().nullable(),
  video_url: z.string().trim().url().max(2048).optional().nullable(),
  calendar_embed_code: z.string().trim().max(12000).optional().nullable(),
  blog_url: z.string().trim().url().max(2048).optional().nullable(),
  linkedin: z.string().trim().url().max(2048).optional().nullable(),
  personal_quote: z.string().trim().max(1000).optional().nullable(),
  testimonials: z.array(z.object({
    quote: z.string().trim().min(1).max(1000),
    author: z.string().trim().min(1).max(200),
  })).max(20).optional().nullable(),
  credentials: z.array(z.string().trim().min(1).max(200)).max(50).optional().nullable(),
  specialties: z.array(z.string().trim().min(1).max(200)).max(50).optional().nullable(),
  years_experience: z.number().int().min(0).max(80).optional().nullable(),
  city: z.string().trim().max(120).optional().nullable(),
  state: z.string().trim().length(2).optional().nullable(),
  display_order: z.number().int().min(0).max(100000).optional().nullable(),
  is_active: z.boolean().optional().nullable(),
  is_leadership: z.boolean().optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
}).strict()

export async function POST(request: NextRequest) {
  try {
    // Verify caller is admin
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const profile = profileData as Pick<Profile, 'role'> | null

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const parsedBody = advisorPayloadSchema.safeParse(await request.json())
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: 'Invalid advisor payload', details: parsedBody.error.flatten() },
        { status: 400 }
      )
    }
    const payload = parsedBody.data

    const adminClient = createAdminClient()

    // Insert into the advisor table
    const advisorTable = adminClient.from('advisor') as any
    const { data: advisorData, error: insertError } = await advisorTable
      .insert({
        ...payload,
        email: payload.email.toLowerCase(),
        name: payload.name || null,
        created_by: user.id,
      })
      .select('id')
      .single()

    const advisor = advisorData as Pick<Advisor, 'id'> | null

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    if (!advisor) {
      return NextResponse.json({ error: 'Advisor creation failed' }, { status: 500 })
    }

    return NextResponse.json({ id: advisor.id, success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
