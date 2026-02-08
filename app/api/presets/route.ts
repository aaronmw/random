import {
  PresetCreateSchema,
  PresetDeleteSchema,
} from '@/lib/validators/apiSchemas'
import { rateLimit } from '@/lib/middleware/rateLimit'
import { supabaseClient } from '@/supabase/client'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const rateLimitResult = rateLimit(request)
  if (!rateLimitResult.success) {
    return rateLimitResult.response!
  }
  try {
    const { data, error } = await supabaseClient.from('presets').select('*')

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Database error' },
        { status: 500 },
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimit(request)
  if (!rateLimitResult.success) {
    return rateLimitResult.response!
  }

  try {
    const body = await request.json()

    const validationResult = PresetCreateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 },
      )
    }

    const { label, figma_user_id, id, visibility } = validationResult.data

    const { data, error } = await supabaseClient.from('presets').upsert(
      {
        ...(id && { id }),
        label,
        figma_user_id,
        ...(visibility && { visibility }),
      },
      {
        onConflict: 'id',
      },
    )

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Database error' },
        { status: 500 },
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 },
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  const rateLimitResult = rateLimit(request)
  if (!rateLimitResult.success) {
    return rateLimitResult.response!
  }

  try {
    const body = await request.json()

    const validationResult = PresetDeleteSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 },
      )
    }

    const { id } = validationResult.data

    const { data, error } = await supabaseClient
      .from('presets')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Database error' },
        { status: 500 },
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 },
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
